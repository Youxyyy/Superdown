const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow; // Make mainWindow a global variable

function createWindow() {
    mainWindow = new BrowserWindow({ // Assign to the global variable
        width: 1200,
        height: 800,
        icon: path.join(__dirname, 'assets/127.png'), // Set the application icon
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            // Note: In a real app, contextIsolation should be true and nodeIntegration should be false for security.
            // For this project's simplicity and for reveal.js to work easily, we might relax this later if needed.
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
    // mainWindow.webContents.openDevTools(); // Uncomment for debugging
}

// --- Application Menu ---
function createMenu() {
    const menuTemplate = [
        {
            label: '文件',
            submenu: [
                {
                    label: '打开',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => {
                        dialog.showOpenDialog(mainWindow, {
                            properties: ['openFile'],
                            filters: [{ name: 'Markdown Files', extensions: ['md', 'markdown'] }]
                        }).then(result => {
                            if (!result.canceled && result.filePaths.length > 0) {
                                const filePath = result.filePaths[0];
                                fs.readFile(filePath, 'utf8', (err, data) => {
                                    if (err) {
                                        console.error(err);
                                        return;
                                    }
                                    mainWindow.webContents.send('file-opened', data);
                                });
                            }
                        }).catch(err => {
                            console.error(err);
                        });
                    }
                },
                {
                    label: '另存为...',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => {
                        mainWindow.webContents.send('get-content-for-save');
                    }
                },
                {
                    label: '导出为 PDF...',
                    accelerator: 'CmdOrCtrl+P',
                    click: () => {
                        mainWindow.webContents.send('export-pdf');
                    }
                },
                { type: 'separator' },
                {
                    label: '退出',
                    role: 'quit'
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
    createWindow();
    createMenu();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// --- IPC Listeners ---
ipcMain.on('save-content', (event, content) => {
    dialog.showSaveDialog(mainWindow, {
        title: '保存 Markdown 文件',
        defaultPath: 'untitled.md',
        filters: [{ name: 'Markdown Files', extensions: ['md', 'markdown'] }]
    }).then(result => {
        if (!result.canceled && result.filePath) {
            fs.writeFile(result.filePath, content, 'utf8', (err) => {
                if (err) console.error(err);
            });
        }
    }).catch(err => {
        console.error(err);
    });
});

ipcMain.on('pdf-content', (event, content) => {
    const pdfPath = dialog.showSaveDialogSync(mainWindow, {
        title: '导出为 PDF',
        defaultPath: 'document.pdf',
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    });

    if (pdfPath) {
        // 创建一个临时窗口来渲染 PDF
        let pdfWindow = new BrowserWindow({
            width: 800,
            height: 600,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        // 创建一个临时的 HTML 文件
        const tempHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <link rel="stylesheet" href="${content.css}">
                <style>
                    body {
                        padding: 40px;
                        max-width: 210mm;
                        margin: 0 auto;
                    }
                    .markdown-body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
                        line-height: 1.6;
                        color: #24292e;
                    }
                </style>
            </head>
            <body>
                ${content.html}
            </body>
            </html>
        `;

        // 加载临时 HTML
        pdfWindow.loadURL('data:text/html;charset=UTF-8,' + encodeURIComponent(tempHtml));

        // 等待页面加载完成后生成 PDF
        pdfWindow.webContents.on('did-finish-load', () => {
            const pdfOptions = {
                marginsType: 1,
                pageSize: 'A4',
                printBackground: true,
                printSelectionOnly: false,
                landscape: false
            };

            pdfWindow.webContents.printToPDF(pdfOptions).then(data => {
                fs.writeFile(pdfPath, data, (error) => {
                    if (error) throw error;
                    console.log('PDF 生成成功');
                    mainWindow.webContents.send('pdf-generation-complete');
                    pdfWindow.close();
                });
            }).catch(error => {
                console.log('PDF 生成失败:', error);
                mainWindow.webContents.send('pdf-generation-complete');
                pdfWindow.close();
            });
        });
    } else {
        mainWindow.webContents.send('pdf-generation-complete');
    }
}); 