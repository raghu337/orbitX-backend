const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

walkDir(path.join(__dirname, '../src'), (filePath) => {
  if (!filePath.endsWith('.js') && !filePath.endsWith('.tsx') && !filePath.endsWith('.ts') && !filePath.endsWith('.jsx')) {
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Match import { ... } from 'react-native'; (supports multi-line)
  const rnImportRegex = /import\s+\{([^}]+)\}\s+from\s+['"]react-native['"]/g;
  
  let match;
  let modified = false;
  
  // We use replace with function to do precise replacements
  const newContent = content.replace(rnImportRegex, (fullMatch, importContent) => {
    if (importContent.includes('SafeAreaView')) {
      // Split by commas, filter out SafeAreaView and empty values, then re-join
      const parts = importContent
        .split(',')
        .map(p => p.trim())
        .filter(p => p !== 'SafeAreaView' && p !== '');
      
      const newImportContent = parts.join(',\n    ');
      
      modified = true;
      return `import { SafeAreaView } from 'react-native-safe-area-context';\nimport {\n    ${newImportContent},\n} from 'react-native'`;
    }
    return fullMatch;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
});
