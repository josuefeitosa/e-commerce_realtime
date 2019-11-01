'use strict'

const crypto = use('crypto');
const Helpers = use('Helpers');

/**
    Gera uma string aleatória
    @param { int } length - Tamanho da string a ser gerada
    @return { string } - String random do tamanho de length
*/

const str_random = async (length = 40) => {
    let string = '';
    let len = string.length;

    if (len < length) { //verificação failsafe
        let size = length - len;
        let bytes = await crypto.randomBytes(size);
        let buffer = Buffer.from(bytes);

        string += buffer.toString('base64').replace(/[^a-zA-Z0-9]/g, '').substr(0, size);
    }

    return string;
}

/**
    Move um único arquivo para o caminho especificado, caso nenhum for especificado então será movido para
    'public/uploads'.
    @param { FileJar } file - Arquivo a ser movido
    @param { string } path - Caminho para mover
    @return { Object<FileJar> }
*/

const manage_single_upload = async (file, path = null) => {
    path = path ? path : Helpers.publicPatch('uploads');
    const random_name = await str_random(30);

    let filename = `${new Date().getTime()}_${random_name}.${file.subtype}`;
    await file.move(path, {
            name: filename
        });

    return file;
}

/**
    Move múltiplos arquivos para o caminho especificado, caso nenhum for especificado então será movido para
    'public/uploads'.
    @param { FileJar } fileJar - Arquivo a ser movido
    @param { string } path - Caminho para mover
    @return { Object }
*/

const manage_multiple_uploads = async (fileJar, path = null) => {
    path = path ? path : Helpers.publicPatch('uploads');
    let successes = [], errors = [];

    await Promise.all(fileJar.files.map(async file => {
        let random_name = await str_random(30);
        let filename = `${new Date().getTime()}_${random_name}.${file.subtype}`;

        await file.move(path, {
            name: filename
        });

        file.moved() ? successes.push(file) : errors.push(file.error);
    }))

    return { successes, errors };
}

module.exports = {
    str_random,
    manage_single_upload,
    manage_multiple_uploads
}