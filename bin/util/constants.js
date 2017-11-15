const path = require('path');

const projectDir = path.resolve(__dirname, '../../');

module.exports = {
    projectDir,
    srcDir: path.join(projectDir, 'src'),
    publicDir: path.join(projectDir, 'public'),

    entryServerFile: 'entry-server.js',
    entryClientFile: 'entry-client.js',
};
