import * as vscode from 'vscode';

function pickDirectoryPath(): Thenable<string | undefined> {
    return vscode.window.showOpenDialog({
        canSelectFolders: true,
        canSelectFiles: false,
        openLabel: 'Select Directory'
    }).then(uri => {
        if (uri && uri.length > 0) {
            return uri[0].fsPath.replace(/\\/g, '/'); // Replace backslashes with forward slashes
        }
        return undefined;
    });
}

function pickFilePath(): Thenable<string | undefined> {
    return vscode.window.showOpenDialog({
        canSelectFolders: false,
        canSelectFiles: true,
        openLabel: 'Select File'
    }).then(uri => {
        if (uri && uri.length > 0) {
            return uri[0].fsPath.replace(/\\/g, '/'); // Replace backslashes with forward slashes
        }
        return undefined;
    });
}
export function activate(context: vscode.ExtensionContext) {
    // Register commands for picking directories and files
    let disposablePickDirectory = vscode.commands.registerCommand('extension.pickDirectory', () => {
        pickDirectoryPath().then(path => {
            if (path) {
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    const position = editor.selection.active;
                    editor.edit(editBuilder => {
                        editBuilder.insert(position, path);
                    });
                }
            }
        });
    });

    let disposablePickFile = vscode.commands.registerCommand('extension.pickFile', () => {
        pickFilePath().then(path => {
            if (path) {
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    const position = editor.selection.active;
                    editor.edit(editBuilder => {
                        editBuilder.insert(position, path);
                    });
                }
            }
        });
    });

    // Create the tree view for the custom Explorer view
    const directoryFilePickerProvider = new DirectoryFilePickerProvider();
    vscode.window.registerTreeDataProvider('directoryFilePicker', directoryFilePickerProvider);

    // Add disposables to the context subscriptions
    context.subscriptions.push(disposablePickDirectory, disposablePickFile);
}

class DirectoryFilePickerProvider implements vscode.TreeDataProvider<TreeNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined> = new vscode.EventEmitter<TreeNode | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined> = this._onDidChangeTreeData.event;

    getTreeItem(element: TreeNode): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TreeNode): Thenable<TreeNode[]> {
        const items: TreeNode[] = [];

        // Return buttons for picking directories and files directly
        const pickDirectoryButton = new TreeNode('Pick Directory', vscode.TreeItemCollapsibleState.None);
        pickDirectoryButton.command = { command: 'extension.pickDirectory', title: 'Pick Directory' };
        items.push(pickDirectoryButton);

        const pickFileButton = new TreeNode('Pick File', vscode.TreeItemCollapsibleState.None);
        pickFileButton.command = { command: 'extension.pickFile', title: 'Pick File' };
        items.push(pickFileButton);

        return Promise.resolve(items);
    }
}

class TreeNode extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly iconPath?: vscode.ThemeIcon
    ) {
        super(label, collapsibleState);
    }

    declare command?: vscode.Command;
}

export function deactivate() {}