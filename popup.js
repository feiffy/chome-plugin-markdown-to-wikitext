document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('convert-button').addEventListener('click', () => {
        const markdownInput = document.getElementById('markdown-input').value;
        const wikitextOutput = convertMarkdownToWikitext(markdownInput);
        document.getElementById('wikitext-output').value = wikitextOutput;
      });
      
      let listLevel = 0;
    function convertMarkdownToWikitext(markdown) {
        const md = new markdownit();
        const tokens = md.parse(markdown, {});
        let output = '';
        let inCodeBlock = false;
    
        tokens.forEach(token => {
          if (token.type === 'heading_open') {
            const hasNewline = output.endsWith('\n');
            output += (hasNewline ? '\n' : '\n\n') + '='.repeat(parseInt(token.tag.slice(1)) + 1) + ' ';
          } else if (token.type === 'heading_close') {
            output = output.trimEnd() + ' ' + '='.repeat(parseInt(token.tag.slice(1)) + 1) + '\n\n';
          } else if (token.type === 'inline') {
            output += processInline(token.children);
          } else if (token.type === 'bullet_list_open') {
            listLevel++;
          } else if (token.type === 'bullet_list_close') {
            listLevel = Math.max(0, listLevel - 1);
          } else if (token.type === 'list_item_open') {
            output += '\n' + ' '.repeat(Math.max(0, listLevel-1)*2) + '*';
          } else if (token.type === 'table_open') {
            output += '{| class="wikitable"\n';
          } else if (token.type === 'table_close') {
            output += '|}\n';
          } else if (token.type === 'tr_open') {
            output += '|-\n';
          } else if (token.type === 'th_open') {
            output += '!';
          } else if (token.type === 'td_open') {
            output += '|';
          } else if (token.type === 'fence') {
            const lang = token.info.trim() || '';
            const hasPrecedingNewline = output.endsWith('\n');
            output += (hasPrecedingNewline ? '' : '\n') + `\n<syntaxhighlight lang="${lang}">\n${token.content}\n</syntaxhighlight>\n\n`;
          }
        });
        return output.trim();
      }
    
      function processInline(tokens) {
        return tokens.map(t => {
          if (t.type === 'strong_open') return "'''";
          if (t.type === 'strong_close') return "'''";
          if (t.type === 'em_open') return "''";
          if (t.type === 'em_close') return "''";
          if (t.type === 'link_open') {
            const href = t.attrs.find(a => a[0] === 'href')[1];
            return `[${href} `;
          }
          if (t.type === 'link_close') return ']';
          if (t.type === 'code_inline') return `<code>${t.content}</code>`;
          return t.content;
        }).join('');
      }
    
      // 添加一个按钮，将转换后的 Wikitext 复制到剪贴板。
      document.getElementById('copy-button').addEventListener('click', () => {
        const wikitextOutput = document.getElementById('wikitext-output');
        wikitextOutput.select();
        document.execCommand('copy');
      });
    });