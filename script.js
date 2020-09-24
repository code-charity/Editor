function improveMessage(message, length, language) {
    var last_char = Number(String(length).slice(-1));

    if (language === 'en') {
        if (last_char != 1) {
            message += 's';
        }
    } else if (language === 'ru') {
        if (last_char < 1 || last_char > 4 || [11, 12, 13, 14].indexOf(length) !== -1) {
            message += 'ов';
        } else if (last_char > 1 && last_char < 5) {
            message += 'а';
        }
    }
    
    return message;
}

satus.locale.import(function(language) {
    var characters = satus.locale.getMessage('characters'),
        bytes = satus.locale.getMessage('bytes');

    satus.render({
        text_field: {
            type: 'text-field',
            rows: 8,
            oninput: function() {
                var blob = new Blob([this.value]).size,
                    length = this.value.length;

                document.querySelector('.satus-text').innerText = length + ' ' + improveMessage(characters, length, language) + ', ' + blob + ' ' + improveMessage(bytes, blob, language);
            }
        },
        text: {
            type: 'text',
            innerText: '0 ' + improveMessage(characters, 0, language) + ', 0 ' + improveMessage(bytes, 0, language)
        }
    });
});
