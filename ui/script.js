/*--------------------------------------------------------------
>>> TEXT EDITOR:
----------------------------------------------------------------
# Global variables
# Functions
# Skeleton
# Initialization
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLES
--------------------------------------------------------------*/

var functions = {};
















/*--------------------------------------------------------------
# FUNCTIONS
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# NEW FILE
--------------------------------------------------------------*/

functions.newFile = function () {
    var textarea = skeleton.main.textarea.rendered;

    textarea.indexId = undefined;
    textarea.name = undefined;
    textarea.value = '';

    satus.indexeddb.clear('session');

    skeleton.footer.section_align_start.span.rendered.update();
    skeleton.footer.section_align_end.span.rendered.update();
};


/*--------------------------------------------------------------
# OPEN FILE
--------------------------------------------------------------*/

functions.openFile = function (id) {
    satus.indexeddb.clear('session');
    
    satus.indexeddb.getByKey({
        content: [
            id
        ],
        files: [
            id
        ]
    }, function (items) {
        if (items.files[0]) {
            var textarea = skeleton.main.textarea.rendered;

            textarea.indexId = id;
            textarea.name = items.files[0].name;
            textarea.value = items.content[0].content;

            skeleton.main.sidebar.list.update();

            skeleton.footer.section_align_start.span.rendered.update();
            skeleton.footer.section_align_end.span.rendered.update();

            satus.indexeddb.set({
                session: [
                    {id}
                ]
            });
        }
    });
};


/*--------------------------------------------------------------
# SAVE
--------------------------------------------------------------*/

functions.save = function (name, content, id) {
    if (satus.isset(id) || name) {
        var object = {
            time: new Date().getTime(),
            name: name
        };

        if (id) {
            object.id = id;
        }

        satus.indexeddb.clear('session');

        satus.indexeddb.set({
            files: [
                object
            ]
        }, function () {
            satus.indexeddb.get({
                files: {
                    direction: 'prev',
                    limit: 1
                }
            }, function (items) {
                if (items.files[0]) {
                    skeleton.main.textarea.indexId = items.files[0].id;

                    satus.indexeddb.set({
                        content: [
                            {
                                id: items.files[0].id,
                                content: content
                            }
                        ],
                        session: [
                            {
                                id: items.files[0].id
                            }
                        ]
                    }, function () {
                        satus.indexeddb.get({
                            content: {
                                direction: 'prev',
                                limit: 1
                            }
                        }, function (items) {
                            if (items.content[0]) {
                                skeleton.main.sidebar.list.update();
                            }
                        });
                    });
                }
            });
        });
    } else {
        satus.render({
            component: 'modal',

            input: {
                component: 'input',
                properties: {
                    type: 'text',
                    value: name || 'untitled'
                },
                on: {
                    render: function () {
                        this.focus();
                    }
                }
            },
            section_align_end: {
                component: 'section',
                variant: 'actions',

                cancel: {
                    component: 'button',
                    text: 'cancel',
                    on: {
                        click: function () {
                            this.parentNode.parentNode.parentNode.close();
                        }
                    }
                },
                save: {
                    component: 'button',
                    text: 'save',
                    on: {
                        click: function () {
                            var modal = this.parentNode.parentNode.parentNode;

                            functions.save(modal.skeleton.input.rendered.value, content, id);

                            modal.close();
                        }
                    }
                }
            }
        });
    }
};


/*--------------------------------------------------------------
# SAVE AS
--------------------------------------------------------------*/

functions.saveAs = function () {
    var textarea = skeleton.main.textarea.rendered;

    chrome.permissions.request({
        permissions: ['downloads']
    }, function (granted) {
        if (granted) {
            chrome.downloads.download({
                url: URL.createObjectURL(new Blob([textarea.value], {
                    type: 'text/plain;charset=utf-8'
                })),
                filename: textarea.name || 'untitled',
                saveAs: true
            });
        }
    });
};


/*--------------------------------------------------------------
# IMPORT
--------------------------------------------------------------*/

functions.import = function () {
    var input = document.createElement('input');

    input.type = 'file';

    input.addEventListener('change', function () {
        var file_reader = new FileReader();

        file_reader.onload = function (event) {
            var textarea = skeleton.main.textarea.rendered;

            textarea.name = input.files[0].name;
            textarea.value = this.result;

            skeleton.footer.section_align_start.span.rendered.update();
            skeleton.footer.section_align_end.span.rendered.update();

            functions.save(
                textarea.name,
                textarea.value
            );
        };

        file_reader.readAsText(this.files[0]);
    });

    input.click();
};


/*--------------------------------------------------------------
# DELETE
--------------------------------------------------------------*/

functions.delete = function (id) {
    satus.render({
        component: 'modal',

        label: {
            component: 'span',
            text: 'areYouSureYouWantToDeleteTheFile'
        },
        section: {
            component: 'section',
            variant: 'actions',

            cancel: {
                component: 'button',
                text: 'cancel',
                on: {
                    click: function () {
                        var modal = this.parentNode.parentNode.parentNode;

                        modal.close();
                    }
                }
            },
            delete: {
                component: 'button',
                text: 'delete',
                on: {
                    click: function () {
                        var modal = this.parentNode.parentNode.parentNode;

                        satus.indexeddb.delete({
                            content: {
                                id: [id]
                            },
                            files: {
                                id: [id]
                            },
                            session: {
                                id: [id]
                            }
                        }, function () {
                            var textarea = skeleton.main.textarea.rendered;

                            textarea.indexId = null;
                            textarea.name = undefined;
                            textarea.value = '';

                            skeleton.footer.section_align_start.span.rendered.update();
                            skeleton.footer.section_align_end.span.rendered.update();

                            satus.indexeddb.set({
                                session: [
                                    {id}
                                ]
                            }, function () {
                                skeleton.main.sidebar.list.update();
                            });
                        });

                        modal.close();
                    }
                }
            }
        }
    });
};


/*--------------------------------------------------------------
# CLOSE FILE
--------------------------------------------------------------*/

functions.closeFile = function () {
    var textarea = skeleton.main.textarea.rendered;

    textarea.indexId = null;
    textarea.name = undefined;
    textarea.value = '';

    satus.indexeddb.clear('session');

    skeleton.main.sidebar.list.update();

    skeleton.footer.section_align_start.span.rendered.update();
    skeleton.footer.section_align_end.span.rendered.update();
};
















/*--------------------------------------------------------------
# SKELETON
--------------------------------------------------------------*/

var skeleton = {
    component: 'base',

    menubar: {
        component: 'menubar',
        items: {
            file: {
                component: 'button',
                text: 'file',
                items: {
                    newFile: {
                        component: 'button',
                        text: 'newFile',
                        on: {
                            click: functions.newFile
                        }
                    },
                    openFile: {
                        component: 'button',
                        text: 'openFile',
                        on: {
                            click: functions.import
                        }
                    },
                    save: {
                        component: 'button',
                        text: 'save',
                        on: {
                            click: function () {
                                var textarea = skeleton.main.textarea.rendered;

                                textarea.saved = true;
                                
                                functions.save(
                                    textarea.name,
                                    textarea.value
                                );
                            }
                        }
                    },
                    saveAs: {
                        component: 'button',
                        text: 'saveAs',
                        on: {
                            click: functions.saveAs
                        }
                    },
                    deleteFile: {
                        component: 'button',
                        text: 'deleteFile',
                        on: {
                            click: function () {
                                functions.delete(skeleton.main.textarea.rendered.indexId);
                            }
                        }
                    },
                    closeFile: {
                        component: 'button',
                        text: 'closeFile',
                        on: {
                            click: function () {
                                functions.closeFile();
                            }
                        }
                    },
                    quit: {
                        component: 'button',
                        text: 'quit',
                        on: {
                            click: function () {
                                window.close();
                            }
                        }
                    }
                }
            },
            edit: {
                component: 'button',
                text: 'edit',
                items: {
                    undo: {
                        component: 'button',
                        text: 'undo',
                        on: {
                            click: function () {
                                document.execCommand('undo', false, null);

                            }
                        }
                    },
                    redo: {
                        component: 'button',
                        text: 'redo',
                        on: {
                            click: function () {
                                document.execCommand('redo', false, null);
                            }
                        }
                    }
                }
            },
            help: {
                component: 'button',
                text: 'help',
                items: {
                    reportABug: {
                        component: 'button',
                        text: 'reportABug',
                        on: {
                            click: function () {
                                window.open('https://github.com/victor-savinov/text-editor/issues', '_blank');
                            }
                        }
                    },
                    github: {
                        component: 'button',
                        text: 'GitHub',
                        on: {
                            click: function () {
                                window.open('https://github.com/victor-savinov/text-editor', '_blank');
                            }
                        }
                    }
                }
            }
        }
    },
    main: {
        component: 'main',

        sidebar: {
            component: 'sidebar',
            class: 'empty',

            h1: {
                component: 'h1',
                text: 'files'
            },
            list: {
                component: 'ul',
                on: {
                    render: function () {
                        this.skeleton.update();
                    }
                },
                update: function () {
                    var list = this.rendered;

                    satus.indexeddb.get({
                        files: {
                            index: 'time'
                        }
                    }, function (items) {
                        var textarea = skeleton.main.textarea.rendered;

                        satus.empty(list);

                        if (items.files.length > 0) {
                            skeleton.main.sidebar.rendered.classList.remove('empty');
                        } else {
                            skeleton.main.sidebar.rendered.classList.add('empty');
                        }

                        for (var i = 0, l = items.files.length; i < l; i++) {
                            var file = items.files[i];

                            satus.render({
                                component: 'li',
                                text: file.name || 'untitled',
                                class: file.id === textarea.indexId ? 'selected' : '',
                                properties: {
                                    indexId: file.id
                                },
                                on: {
                                    click: function () {
                                        functions.openFile(this.indexId);
                                    }
                                },
                                contextMenu: {
                                    rename: {
                                        component: 'button',
                                        text: 'rename',
                                        on: {
                                            click: function () {
                                                var modal = this.parentNode.parentNode,
                                                    file = modal.skeleton.parent.rendered;

                                                satus.render({
                                                    component: 'modal',

                                                    input: {
                                                        component: 'input',
                                                        properties: {
                                                            type: 'text',
                                                            value: file.textContent
                                                        },
                                                        on: {
                                                            render: function () {
                                                                this.focus();
                                                            }
                                                        }
                                                    },
                                                    section_align_end: {
                                                        component: 'section',
                                                        variant: 'actions',

                                                        cancel: {
                                                            component: 'button',
                                                            text: 'cancel',
                                                            on: {
                                                                click: function () {
                                                                    this.parentNode.parentNode.parentNode.close();
                                                                }
                                                            }
                                                        },
                                                        save: {
                                                            component: 'button',
                                                            text: 'save',
                                                            on: {
                                                                click: function () {
                                                                    var modal = this.parentNode.parentNode.parentNode;

                                                                    satus.indexeddb.set({
                                                                        files: [
                                                                            {
                                                                                id: file.indexId,
                                                                                name: modal.skeleton.input.rendered.value,
                                                                                time: new Date().getTime()
                                                                            }
                                                                        ]
                                                                    }, function () {
                                                                        skeleton.main.sidebar.list.update();
                                                                    });

                                                                    modal.close();
                                                                }
                                                            }
                                                        }
                                                    }
                                                });

                                                modal.close();
                                            }
                                        }
                                    },
                                    delete: {
                                        component: 'button',
                                        text: 'delete',
                                        on: {
                                            click: function () {
                                                var modal = this.parentNode.parentNode;

                                                functions.delete(modal.skeleton.parent.rendered.indexId);

                                                modal.close();
                                            }
                                        }
                                    }
                                }
                            }, list);
                        }
                    });
                }
            }
        },
        textarea: {
            component: 'textarea',
            properties: {
                saved: false
            },
            on: {
                input: function () {
                    this.saved = false;
                },
                selectionchange: function () {
                    skeleton.footer.section_align_start.span.rendered.update();
                    skeleton.footer.section_align_end.span.rendered.update();
                }
            }
        }
    },
    footer: {
        component: 'footer',

        section_align_start: {
            component: 'section',
            variant: 'align-start',

            span: {
                component: 'span',
                text: function () {
                    return satus.locale.get('line') + ' 1, ' + satus.locale.get('column') + ' 1';
                },
                properties: {
                    update: function () {
                        var textarea = skeleton.main.textarea.rendered,
                            message = skeleton.footer.section_align_start.span.rendered,
                            selection_start = textarea.textarea.selectionStart,
                            selection_end = textarea.textarea.selectionEnd;

                        if (selection_start === selection_end) {
                            if (textarea.textarea.selectionDirection === 'forward') {
                                var column = textarea.textarea.selectionEnd;
                            } else {
                                var column = textarea.textarea.selectionStart;
                            }

                            var lines = textarea.value.slice(0, column).split('\n');

                            message.textContent = satus.locale.get('line') + ' ' + lines.length + ', ' + satus.locale.get('column') + ' ' + (lines[lines.length - 1].length + 1);
                        } else {
                            var min = Math.min(selection_start, selection_end),
                                max = Math.max(selection_start, selection_end),
                                selected_text = textarea.value.slice(min, max);

                            message.textContent = selected_text.split('\n').length + ' ' + satus.locale.get('lines') + ', ' + selected_text.length + ' ' + satus.locale.get('characters') + ' ' + satus.locale.get('selected');
                        }
                    }
                }
            }
        },
        section_align_end: {
            component: 'section',
            variant: 'align-end',

            span: {
                component: 'span',
                style: {
                    textTransform: 'capitalize'
                },
                text: function () {
                    return satus.locale.get('characters') + ' 0, ' + satus.locale.get('bytes') + ' 0';
                },
                properties: {
                    update: function () {
                        var value = skeleton.main.textarea.rendered.value,
                            message = skeleton.footer.section_align_end.span.rendered;

                        message.textContent = satus.locale.get('characters') + ' ' + value.length + ', ' + satus.locale.get('bytes') + ' ' + new Blob([value]).size;
                    }
                }
            }
        }
    }
};
















/*--------------------------------------------------------------
# KEYBOARD
--------------------------------------------------------------*/

window.addEventListener('keydown', function (event) {
    if (event.code === 'KeyN' && event.ctrlKey === true) {
        event.preventDefault();
        event.stopPropagation();

        functions.newFile();

        return false;
    } else if (event.code === 'KeyO' && event.ctrlKey === true) {
        event.preventDefault();
        event.stopPropagation();

        functions.import();

        return false;
    } else if (event.code === 'KeyS' && event.ctrlKey === true && event.shiftKey === true) {
        event.preventDefault();
        event.stopPropagation();

        functions.saveAs();

        return false;
    } else if (event.code === 'KeyS' && event.ctrlKey === true) {
        var textarea = skeleton.main.textarea.rendered;

        event.preventDefault();
        event.stopPropagation();

        functions.save(textarea.name, textarea.value, textarea.indexId);

        return false;
    } else if (event.code === 'KeyQ' && event.ctrlKey === true) {
        event.preventDefault();
        event.stopPropagation();

        window.close();

        return false;
    }
}, true);
















/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

satus.indexeddb.open('text-editor', {
    files: {
        indexes: [
            'id',
            'time',
            'name'
        ],
        keyOptions: {
            keyPath: 'id',
            autoIncrement: true
        }
    },
    content: {
        indexes: [
            'id',
            'content'
        ],
        keyOptions: {
            keyPath: 'id',
            autoIncrement: false
        }
    },
    session: {
        indexes: [
            'id'
        ],
        keyOptions: {
            keyPath: 'id'
        }
    },
    options: {
        indexes: [
            'key',
            'value'
        ],
        keyOptions: {
            keyPath: 'key'
        }
    }
}, function () {
	satus.indexeddb.get({
        session: {},
		options: {}
	}, function (items) {
		console.log('options', items);

		satus.locale.import(items.options.language, '../_locales/', function () {
	        satus.render(skeleton);

            if (items.session[0]) {
                functions.openFile(items.session[0].id);
            }
	    });
	});
});