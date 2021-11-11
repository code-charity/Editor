/*--------------------------------------------------------------
>>> TEXT EDITOR
----------------------------------------------------------------
# 
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# 
--------------------------------------------------------------*/

var skeleton = {
    component: 'base',

    menubar: {
        component: 'menubar',
        items: [
            [{
                    component: 'button',
                    text: 'file'
                },
                {
                    component: 'button',
                    text: 'newFile'
                },
                {
                    component: 'button',
                    text: 'saveAs'
                },
                {
                    component: 'button',
                    text: 'quit'
                }
            ]
        ]
    },
    main: {
        component: 'main',

        textarea: {
            component: 'textarea',
            on: {
                input: function () {
                    var section_align_end = skeleton.footer.section_align_end,
                        characters = this.value.length,
                        bytes = new Blob([this.value]).size;

                    section_align_end.characters.value.rendered.textContent = characters;
                    section_align_end.bytes.value.rendered.textContent = bytes;
                },
                selectionchange: function () {
                    var textarea = skeleton.main.textarea.rendered,
                        section_align_start = skeleton.footer.section_align_start,
                        column = 0;

                    if (textarea.selectionDirection === 'forward') {
                        var column = textarea.selectionEnd;
                    } else {
                        var column = textarea.selectionStart;
                    }

                    var lines = textarea.value.substr(0, column).split('\n');

                    section_align_start.line.value.rendered.textContent = lines.length;
                    section_align_start.column.value.rendered.textContent = lines[lines.length - 1].length + 1;
                }
            }
        }
    },
    footer: {
        component: 'footer',

        section_align_start: {
            component: 'section',
            variant: 'align-start',

            line: {
                component: 'span',

                label: {
                    component: 'span',
                    text: 'line'
                },
                value: {
                    component: 'span',
                    text: '0'
                }
            },
            column: {
                component: 'span',

                label: {
                    component: 'span',
                    text: 'column'
                },
                value: {
                    component: 'span',
                    text: '0'
                }
            }
        },
        section_align_end: {
            component: 'section',
            variant: 'align-end',

            characters: {
                component: 'span',

                label: {
                    component: 'span',
                    text: 'characters'
                },
                value: {
                    component: 'span',
                    text: '0'
                }
            },
            bytes: {
                component: 'span',

                label: {
                    component: 'span',
                    text: 'bytes'
                },
                value: {
                    component: 'span',
                    text: '0'
                }
            }
        }
    }
};


/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

satus.storage.import(function (items) {
    var language = items.language || window.navigator.language;

    if (language.indexOf('en') === 0) {
        language = 'en';
    }

    satus.fetch('_locales/' + language + '/messages.json', function (object) {
        for (var key in object) {
            satus.locale.strings[key] = object[key].message;
        }

        satus.render(skeleton);
    });
});