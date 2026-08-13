const declarationKeywords = [
  'app', 'state', 'remember', 'data', 'api', 'theme', 'style', 'animation',
  'action', 'function', 'screen'
];

const controlKeywords = [
  'if', 'else', 'for', 'in', 'return', 'let', 'set', 'show', 'do', 'go', 'request',
  'into', 'from', 'to', 'default', 'with', 'and', 'or', 'not'
];

const layoutKeywords = [
  'column', 'row', 'grid', 'card', 'form', 'section', 'header', 'footer',
  'nav', 'aside', 'hero', 'overlay'
];

const elementKeywords = [
  'title', 'heading', 'subtitle', 'text', 'paragraph', 'label', 'caption',
  'quote', 'code', 'badge', 'icon', 'link', 'image', 'progress', 'divider', 'spacer'
];

const controlElementKeywords = [
  'input', 'textarea', 'number', 'date', 'email', 'password', 'search', 'url',
  'phone', 'color', 'time', 'slider', 'toggle', 'choice', 'select', 'tabs',
  'radio', 'button', 'submit'
];

const decoratorKeywords = ['as', 'using', 'id', 'animate', 'alt', 'step'];
const constants = ['true', 'false', 'null'];
const builtins = [
  'length', 'append', 'remove', 'contains', 'first', 'last', 'at', 'find_by',
  'where', 'sort_by', 'replace', 'field', 'fields'
];

export function registerLumaLanguage(monaco) {
  if (!monaco?.languages) throw new Error('registerLumaLanguage needs the Monaco API.');
  if (monaco.languages.getLanguages().some((language) => language.id === 'luma')) return;

  monaco.languages.register({ id: 'luma', extensions: ['.luma'], aliases: ['Luma', 'luma'] });
  monaco.languages.setLanguageConfiguration('luma', {
    comments: { lineComment: '#' },
    brackets: [['{', '}'], ['[', ']'], ['(', ')']],
    autoClosingPairs: [
      { open: '"', close: '"' }, { open: "'", close: "'" },
      { open: '[', close: ']' }, { open: '{', close: '}' }, { open: '(', close: ')' }
    ],
    surroundingPairs: [
      { open: '"', close: '"' }, { open: "'", close: "'" },
      { open: '[', close: ']' }, { open: '{', close: '}' }, { open: '(', close: ')' }
    ],
    indentationRules: {
      increaseIndentPattern: /^.*:\s*(?:#.*)?$/,
      decreaseIndentPattern: /^\s*(?:else\s*:|[\]\}])\s*(?:#.*)?$/
    },
    onEnterRules: [{ beforeText: /^.*:\s*(?:#.*)?$/, action: { indentAction: monaco.languages.IndentAction.Indent } }]
  });

  monaco.languages.setMonarchTokensProvider('luma', {
    tokenPostfix: '.luma',
    declarationKeywords,
    controlKeywords,
    layoutKeywords,
    elementKeywords,
    controlElementKeywords,
    decoratorKeywords,
    constants,
    builtins,
    operators: ['=', '==', '!=', '>', '>=', '<', '<=', '+', '-', '*', '/'],
    tokenizer: {
      root: [
        [/[ \t\r\n]+/, 'white'],
        [/(style)(\s+)(#)([A-Za-z_][A-Za-z0-9_]*)/, ['keyword.declaration', 'white', 'annotation', 'identifier']],
        [/#.*$/, 'comment'],
        [/"([^"\\]|\\.)*"/, 'string'],
        [/'([^'\\]|\\.)*'/, 'string'],
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/'([^'\\]|\\.)*$/, 'string.invalid'],
        [/-?(?:\d+\.\d+|\d+|\.\d+)/, 'number'],
        [/[A-Za-z_][A-Za-z0-9_]*/, {
          cases: {
            '@declarationKeywords': 'keyword.declaration',
            '@controlKeywords': 'keyword.control',
            '@layoutKeywords': 'type.identifier',
            '@elementKeywords': 'tag',
            '@controlElementKeywords': 'tag',
            '@decoratorKeywords': 'annotation',
            '@constants': 'constant.language',
            '@builtins': 'predefined',
            '@default': 'identifier'
          }
        }],
        [/==|!=|>=|<=|=|>|<|\+|-|\*|\//, 'operator'],
        [/[{}\[\]()]/, '@brackets'],
        [/[,:.]/, 'delimiter']
      ]
    }
  });
}
