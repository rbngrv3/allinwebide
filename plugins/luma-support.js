/**
 * Luma Language Support for All-In Studio
 * Generated from the Luma 0.5 runtime. Do not edit the embedded runtime by hand.
 */
class LumaError extends Error {
  constructor(message, line) {
    super(line ? `Line ${line}: ${message}` : message);
    this.name = "LumaError";
  }
}

const DEFAULT_THEME = {
  accent: "#2563eb",
  accent_text: "#ffffff",
  canvas: "#f8fafc",
  surface: "#ffffff",
  text: "#172033",
  muted: "#526072",
  outline: "#cbd5e1",
  spacing: 16,
  radius: 12,
  width: 960,
  min_width: 320,
  max_width: 1200,
  font: "system",
  font_size: 16,
  line_height: 1.5,
  motion: 1,
};

const COLOR_STYLE_SETTINGS = new Set([
  "accent", "accent_text", "surface", "surface_end", "text", "muted", "outline",
  "hover_accent", "hover_surface", "hover_text", "hover_outline", "focus_outline",
]);
const NUMBER_STYLE_SETTINGS = new Set([
  "spacing", "gap", "radius", "width", "height", "min_width", "max_width", "min_height", "max_height",
  "padding", "padding_x", "padding_y", "padding_top", "padding_right", "padding_bottom", "padding_left",
  "margin", "margin_x", "margin_y", "margin_top", "margin_right", "margin_bottom", "margin_left",
  "outline_width", "font_size", "font_weight", "line_height", "letter_spacing", "opacity", "scale", "rotation",
  "columns", "aspect_ratio", "hover_scale", "hover_lift", "press_scale", "transition",
]);
const TEXT_STYLE_SETTINGS = new Set(["gradient", "shadow", "font", "text_align", "align", "justify", "overflow"]);
const BOOLEAN_STYLE_SETTINGS = new Set(["wrap"]);
const STYLE_SETTINGS = new Set([...COLOR_STYLE_SETTINGS, ...NUMBER_STYLE_SETTINGS, ...TEXT_STYLE_SETTINGS, ...BOOLEAN_STYLE_SETTINGS]);
const ANIMATION_SETTINGS = new Set(["effect", "duration", "delay", "easing", "repeat", "stagger"]);
const DESIGN_SETTINGS = new Set(["intent", "feel", "size", "emphasis", "motion", "mood", "density"]);
const DESIGN_CHOICES = {
  intent: ["primary", "secondary", "quiet", "danger", "success"],
  feel: ["confident", "soft", "crisp", "playful"],
  size: ["compact", "comfortable", "generous"],
  emphasis: ["low", "medium", "high"],
  motion: ["none", "gentle", "spring"],
  mood: ["calm", "vivid", "midnight", "warm"],
  density: ["compact", "standard", "airy"],
};

function meaningfulLine(lines, start) {
  for (let index = start; index < lines.length; index += 1) {
    const trimmed = lines[index].text.trim();
    if (trimmed && !trimmed.startsWith("#")) return lines[index];
  }
  return null;
}

function indentation(text) {
  const match = text.match(/^[ ]*/);
  if (text.startsWith("\t")) throw new LumaError("Use spaces for indentation, not tabs.");
  return match[0].length;
}

function expressionTokens(source, line) {
  const tokens = [];
  let index = 0;
  while (index < source.length) {
    const character = source[index];
    if (/\s/.test(character)) {
      index += 1;
      continue;
    }
    if (character === '"' || character === "'") {
      const quote = character;
      let value = "";
      index += 1;
      while (index < source.length && source[index] !== quote) {
        if (source[index] === "\\") {
          const next = source[index + 1];
          const escapes = { n: "\n", r: "\r", t: "\t", "\\": "\\", '"': '"', "'": "'" };
          if (!next || !(next in escapes)) throw new LumaError("That escape sequence is not understood.", line);
          value += escapes[next];
          index += 2;
        } else {
          value += source[index];
          index += 1;
        }
      }
      if (source[index] !== quote) throw new LumaError("This string is missing its closing quote.", line);
      tokens.push({ type: "string", value });
      index += 1;
      continue;
    }
    const number = source.slice(index).match(/^\d+(?:\.\d+)?/);
    if (number) {
      tokens.push({ type: "number", value: Number(number[0]) });
      index += number[0].length;
      continue;
    }
    const name = source.slice(index).match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (name) {
      tokens.push({ type: "name", value: name[0] });
      index += name[0].length;
      continue;
    }
    const operator = source.slice(index).match(/^(==|!=|>=|<=|\+|-|\*|\/|>|<|\(|\)|\[|\]|\{|\}|:|\.|,)/);
    if (operator) {
      tokens.push({ type: "operator", value: operator[0] });
      index += operator[0].length;
      continue;
    }
    throw new LumaError(`I do not understand "${character}" in this expression.`, line);
  }
  tokens.push({ type: "end", value: "" });
  return tokens;
}

function parseExpression(source, line) {
  const tokens = expressionTokens(source, line);
  let position = 0;
  const peek = () => tokens[position];
  const take = () => tokens[position++];
  const accepts = (value) => {
    if (peek().value === value) {
      take();
      return true;
    }
    return false;
  };

  function primary() {
    const token = take();
    if (token.type === "number" || token.type === "string") return { type: "literal", value: token.value };
    if (token.type === "name") {
      if (token.value === "true") return { type: "literal", value: true };
      if (token.value === "false") return { type: "literal", value: false };
      if (token.value === "null") return { type: "literal", value: null };
      if (accepts("(")) {
        const args = [];
        if (!accepts(")")) {
          do {
            args.push(logicalOr());
          } while (accepts(","));
          if (!accepts(")")) throw new LumaError("This function call needs a closing parenthesis.", line);
        }
        return { type: "call", name: token.value, args };
      }
      return { type: "name", value: token.value };
    }
    if (token.value === "(") {
      const expression = logicalOr();
      if (!accepts(")")) throw new LumaError("This opening parenthesis needs a closing parenthesis.", line);
      return expression;
    }
    if (token.value === "[") {
      const values = [];
      if (!accepts("]")) {
        do {
          values.push(logicalOr());
        } while (accepts(","));
        if (!accepts("]")) throw new LumaError("This list needs a closing ']'.", line);
      }
      return { type: "list", values };
    }
    if (token.value === "{") {
      const fields = [];
      if (!accepts("}")) {
        do {
          const name = take();
          if (name.type !== "name" && name.type !== "string") throw new LumaError("A record field needs a name such as title:.", line);
          if (!accepts(":")) throw new LumaError(`The field '${name.value}' needs a colon after its name.`, line);
          fields.push({ name: name.value, value: logicalOr() });
        } while (accepts(","));
        if (!accepts("}")) throw new LumaError("This record needs a closing '}'.", line);
      }
      return { type: "record", fields };
    }
    throw new LumaError("I expected a value here.", line);
  }

  function postfix() {
    let value = primary();
    while (true) {
      if (accepts(".")) {
        const field = take();
        if (field.type !== "name") throw new LumaError("After '.', use a record field name.", line);
        value = { type: "field", record: value, name: field.value };
        continue;
      }
      if (peek().value === "with") {
        take();
        const update = primary();
        if (update.type !== "record") throw new LumaError("After 'with', use a record such as { complete: true }.", line);
        value = { type: "merge", record: value, update };
        continue;
      }
      return value;
    }
  }

  function unary() {
    if (accepts("-")) return { type: "unary", operator: "-", value: unary() };
    if (peek().value === "not") {
      take();
      return { type: "unary", operator: "not", value: unary() };
    }
    return postfix();
  }
  function binary(next, operators) {
    let left = next();
    while (operators.includes(peek().value)) {
      const operator = take().value;
      left = { type: "binary", operator, left, right: next() };
    }
    return left;
  }
  const product = () => binary(unary, ["*", "/"]);
  const sum = () => binary(product, ["+", "-"]);
  const comparison = () => binary(sum, [">", ">=", "<", "<="]);
  const equality = () => binary(comparison, ["==", "!="]);
  const logicalAnd = () => binary(equality, ["and"]);
  const logicalOr = () => binary(logicalAnd, ["or"]);
  const result = logicalOr();
  if (peek().type !== "end") throw new LumaError(`I was not expecting "${peek().value}" here.`, line);
  return result;
}

function namesFrom(source, line, kind) {
  if (!source.trim()) return [];
  const names = source.trim().split(/\s+/);
  for (const name of names) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) throw new LumaError(`A ${kind} name must use letters, numbers, or _.`, line);
  }
  return names;
}

function visualDecorators(source, line, { needsValue = true } = {}) {
  let remaining = source.trim();
  const decorators = { role: null, style: null, id: null, animation: null };
  const propertyFor = { as: "role", using: "style", id: "id", animate: "animation" };
  while (true) {
    const suffix = remaining.match(/^(.*)\s+(as|using|id|animate)\s+([A-Za-z_][A-Za-z0-9_]*)$/);
    if (!suffix) break;
    const [, before, word, name] = suffix;
    const property = propertyFor[word];
    if (decorators[property]) throw new LumaError(`This element already has a '${word}' detail.`, line);
    decorators[property] = name;
    remaining = before.trim();
  }
  if (needsValue && !remaining) throw new LumaError("This element needs a value before its visual details.", line);
  if (!needsValue && remaining) throw new LumaError("After a layout name, use only 'using style_name' or 'id element_name'.", line);
  return { source: remaining, ...decorators };
}

function parse(source) {
  const lines = source.replace(/\r\n/g, "\n").split("\n").map((text, index) => ({ text, line: index + 1 }));
  let position = 0;
  function skipEmpty() {
    while (position < lines.length) {
      const trimmed = lines[position].text.trim();
      if (trimmed && !trimmed.startsWith("#")) return;
      position += 1;
    }
  }
  function block(expectedIndent) {
    const statements = [];
    while (true) {
      skipEmpty();
      if (position >= lines.length) break;
      const current = lines[position];
      const actualIndent = indentation(current.text);
      if (actualIndent < expectedIndent) break;
      if (actualIndent > expectedIndent) throw new LumaError("This line is indented, but nothing above starts a block.", current.line);
      statements.push(statement(actualIndent));
    }
    return statements;
  }
  function requiredChildIndent(parent) {
    const child = meaningfulLine(lines, position);
    if (!child || indentation(child.text) <= parent) {
      throw new LumaError("A line ending with ':' needs an indented block below it.", lines[position - 1]?.line);
    }
    return indentation(child.text);
  }
  function choiceOptionBlock(expectedIndent) {
    const options = [];
    while (true) {
      skipEmpty();
      if (position >= lines.length) break;
      const current = lines[position];
      const actualIndent = indentation(current.text);
      if (actualIndent < expectedIndent) break;
      if (actualIndent > expectedIndent) throw new LumaError("A choice option is indented too far.", current.line);
      position += 1;
      const option = parseExpression(current.text.trim(), current.line);
      if (option.type !== "literal" || typeof option.value !== "string") {
        throw new LumaError("Each choice option needs to be a quoted piece of text.", current.line);
      }
      options.push(option);
    }
    return options;
  }
  function completeExpression(source, currentIndent, line) {
    let combined = source;
    const openFor = { "[": "]", "{": "}", "(": ")" };
    const stackFor = (value) => {
      const stack = [];
      for (const token of expressionTokens(value, line)) {
        if (token.type === "operator" && token.value in openFor) stack.push(openFor[token.value]);
        else if (token.type === "operator" && ["]", "}", ")"].includes(token.value)) {
          if (stack.at(-1) !== token.value) throw new LumaError(`I was not expecting '${token.value}' in this value.`, line);
          stack.pop();
        }
      }
      return stack;
    };
    let stack = stackFor(combined);
    while (stack.length > 0) {
      while (position < lines.length && (!lines[position].text.trim() || lines[position].text.trim().startsWith("#"))) position += 1;
      if (position >= lines.length) throw new LumaError(`This value needs a closing '${stack.at(-1)}'.`, line);
      const continuation = lines[position];
      const actualIndent = indentation(continuation.text);
      const trimmed = continuation.text.trim();
      if (actualIndent < currentIndent || (actualIndent === currentIndent && !/^[\]\})]/.test(trimmed))) {
        throw new LumaError(`This value needs a closing '${stack.at(-1)}' before the next instruction.`, line);
      }
      position += 1;
      combined += ` ${trimmed}`;
      stack = stackFor(combined);
    }
    return combined;
  }
  function valueExpression(source, currentIndent, line) {
    return parseExpression(completeExpression(source, currentIndent, line), line);
  }
  function themeBlock(expectedIndent, kind = "theme") {
    const values = [];
    while (true) {
      skipEmpty();
      if (position >= lines.length) break;
      const current = lines[position];
      const actualIndent = indentation(current.text);
      if (actualIndent < expectedIndent) break;
      if (actualIndent > expectedIndent) throw new LumaError(`A ${kind} setting is indented too far.`, current.line);
      position += 1;
      const setting = current.text.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
      if (!setting) throw new LumaError(`A ${kind} setting looks like 'accent = "#2563eb"'.`, current.line);
      values.push({ name: setting[1], value: valueExpression(setting[2], actualIndent, current.line), line: current.line });
    }
    return values;
  }
  function statement(currentIndent) {
    const current = lines[position++];
    const content = current.text.trim();
    const assignment = content.match(/^(let|value|state|remember|set)\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
    if (assignment) return { type: assignment[1], name: assignment[2], value: valueExpression(assignment[3], currentIndent, current.line), line: current.line };
    const data = content.match(/^data\s+([A-Za-z_][A-Za-z0-9_]*)\s+from\s+(.+?)\s+default\s+(.+)$/);
    if (data) return { type: "data", name: data[1], source: valueExpression(data[2], currentIndent, current.line), value: valueExpression(data[3], currentIndent, current.line), line: current.line };
    const api = content.match(/^api\s+([A-Za-z_][A-Za-z0-9_]*)\s+from\s+(.+)$/);
    if (api) return { type: "api", name: api[1], source: valueExpression(api[2], currentIndent, current.line), line: current.line };
    const app = content.match(/^app\s+(.+)$/);
    if (app) return { type: "app", name: valueExpression(app[1], currentIndent, current.line), line: current.line };
    if (content === "theme:") return { type: "theme", values: themeBlock(requiredChildIndent(currentIndent), "theme"), line: current.line };
    const style = content.match(/^style\s+(#?)([A-Za-z_][A-Za-z0-9_]*):$/);
    if (style) return { type: "style", name: style[2], targetId: style[1] ? style[2] : null, values: themeBlock(requiredChildIndent(currentIndent), "style"), line: current.line };
    const design = content.match(/^design\s+([A-Za-z_][A-Za-z0-9_]*):$/);
    if (design) return { type: "design", name: design[1], values: themeBlock(requiredChildIndent(currentIndent), "design"), line: current.line };
    const animation = content.match(/^animation\s+([A-Za-z_][A-Za-z0-9_]*):$/);
    if (animation) return { type: "animation", name: animation[1], values: themeBlock(requiredChildIndent(currentIndent), "animation"), line: current.line };
    const action = content.match(/^action\s+([A-Za-z_][A-Za-z0-9_]*)(.*?)\s*:\s*$/);
    if (action) return { type: "action", name: action[1], parameters: namesFrom(action[2], current.line, "action"), actions: block(requiredChildIndent(currentIndent)), line: current.line };
    const fn = content.match(/^function\s+([A-Za-z_][A-Za-z0-9_]*)(.*?)\s*:\s*$/);
    if (fn) return { type: "function", name: fn[1], parameters: namesFrom(fn[2], current.line, "function"), body: block(requiredChildIndent(currentIndent)), line: current.line };
    const component = content.match(/^component\s+([A-Za-z_][A-Za-z0-9_]*)(.*?)\s*:\s*$/);
    if (component) return { type: "component", name: component[1], parameters: namesFrom(component[2], current.line, "component"), body: block(requiredChildIndent(currentIndent)), line: current.line };
    const screen = content.match(/^screen\s+([A-Za-z_][A-Za-z0-9_]*):$/);
    if (screen) return { type: "screen", name: screen[1], body: block(requiredChildIndent(currentIndent)), line: current.line };
    const componentUse = content.match(/^use\s+([A-Za-z_][A-Za-z0-9_]*)(?:\((.*)\))?$/);
    if (componentUse) {
      const args = componentUse[2] === undefined || !componentUse[2].trim() ? [] : parseExpression(`[${componentUse[2]}]`, current.line).values;
      return { type: "use", name: componentUse[1], args, line: current.line };
    }
    const layout = content.match(/^(column|row|grid|card|form|section|header|footer|nav|aside|hero|overlay)(.*?)\s*:\s*$/);
    if (layout) {
      const decorators = visualDecorators(`layout${layout[2]}`, current.line);
      if (decorators.source !== "layout") throw new LumaError("After a layout name, use 'using style_name', 'id element_name', or 'animate animation_name'.", current.line);
      if (decorators.role) throw new LumaError("Layouts can use styles and IDs, but not 'as' roles.", current.line);
      return { type: "layout", layout: layout[1], style: decorators.style, id: decorators.id, animation: decorators.animation, body: block(requiredChildIndent(currentIndent)), line: current.line };
    }
    const link = content.match(/^link\s+(.+)$/);
    if (link) {
      const decorators = visualDecorators(link[1], current.line);
      const parts = decorators.source.match(/^(.+?)\s+to\s+(.+)$/);
      if (!parts) throw new LumaError("A link looks like 'link \"Learn more\" to \"https://example.com\"'.", current.line);
      return { type: "link", label: valueExpression(parts[1], currentIndent, current.line), target: valueExpression(parts[2], currentIndent, current.line), role: decorators.role, style: decorators.style, id: decorators.id, animation: decorators.animation, line: current.line };
    }
    const image = content.match(/^image\s+(.+)$/);
    if (image) {
      const decorators = visualDecorators(image[1], current.line);
      const parts = decorators.source.match(/^(.+?)\s+alt\s+(.+)$/);
      if (!parts) throw new LumaError("An image looks like 'image \"photo.png\" alt \"A mountain\"'.", current.line);
      return { type: "image", source: valueExpression(parts[1], currentIndent, current.line), alt: valueExpression(parts[2], currentIndent, current.line), style: decorators.style, id: decorators.id, animation: decorators.animation, line: current.line };
    }
    const progress = content.match(/^progress\s+(.+)$/);
    if (progress) {
      const decorators = visualDecorators(progress[1], current.line);
      const parts = decorators.source.match(/^(.+?)\s+from\s+(.+?)\s+to\s+(.+)$/);
      if (!parts) throw new LumaError("Progress looks like 'progress score from 0 to 100'.", current.line);
      return { type: "progress", value: valueExpression(parts[1], currentIndent, current.line), min: valueExpression(parts[2], currentIndent, current.line), max: valueExpression(parts[3], currentIndent, current.line), style: decorators.style, id: decorators.id, animation: decorators.animation, line: current.line };
    }
    const divider = content.match(/^divider(.*)$/);
    if (divider) {
      const decorators = visualDecorators(`element${divider[1]}`, current.line);
      if (decorators.source !== "element" || decorators.role) throw new LumaError("A divider can use a style, ID, or animation.", current.line);
      return { type: "divider", style: decorators.style, id: decorators.id, animation: decorators.animation, line: current.line };
    }
    const spacer = content.match(/^spacer\s+(.+)$/);
    if (spacer) {
      const decorators = visualDecorators(spacer[1], current.line);
      if (decorators.role) throw new LumaError("A spacer can use a style, ID, or animation, but not a role.", current.line);
      return { type: "spacer", size: valueExpression(decorators.source, currentIndent, current.line), style: decorators.style, id: decorators.id, animation: decorators.animation, line: current.line };
    }
    const contentElement = content.match(/^(title|heading|subtitle|text|paragraph|label|caption|quote|code|badge|icon)\s+(.+)$/);
    if (contentElement) {
      const decorators = visualDecorators(contentElement[2], current.line);
      return { type: contentElement[1], value: valueExpression(decorators.source, currentIndent, current.line), role: decorators.role, style: decorators.style, id: decorators.id, animation: decorators.animation, line: current.line };
    }
    const input = content.match(/^(input|textarea|number|date|email|password|search|url|phone|color|time)\s+([A-Za-z_][A-Za-z0-9_]*)\s+(.+)$/);
    if (input) {
      const decorators = visualDecorators(input[3], current.line);
      if (decorators.role) throw new LumaError("Inputs can use styles and IDs, but not 'as' roles.", current.line);
      return { type: "input", inputType: input[1], state: input[2], label: valueExpression(decorators.source, currentIndent, current.line), style: decorators.style, id: decorators.id, animation: decorators.animation, line: current.line };
    }
    const slider = content.match(/^slider\s+([A-Za-z_][A-Za-z0-9_]*)\s+(.+)$/);
    if (slider) {
      const decorators = visualDecorators(slider[2], current.line);
      if (decorators.role) throw new LumaError("Sliders can use styles and IDs, but not 'as' roles.", current.line);
      const settings = decorators.source.match(/^(.+?)\s+from\s+(.+?)\s+to\s+(.+?)(?:\s+step\s+(.+))?$/);
      if (!settings) throw new LumaError("A slider looks like 'slider energy \"Energy\" from 0 to 10 step 1'.", current.line);
      return { type: "slider", state: slider[1], label: valueExpression(settings[1], currentIndent, current.line), min: valueExpression(settings[2], currentIndent, current.line), max: valueExpression(settings[3], currentIndent, current.line), step: settings[4] ? valueExpression(settings[4], currentIndent, current.line) : null, style: decorators.style, id: decorators.id, animation: decorators.animation, line: current.line };
    }
    const toggle = content.match(/^toggle\s+([A-Za-z_][A-Za-z0-9_]*)\s+(.+)$/);
    if (toggle) {
      const decorators = visualDecorators(toggle[2], current.line);
      if (decorators.role) throw new LumaError("Toggles can use styles and IDs, but not 'as' roles.", current.line);
      return { type: "toggle", state: toggle[1], label: valueExpression(decorators.source, currentIndent, current.line), style: decorators.style, id: decorators.id, animation: decorators.animation, line: current.line };
    }
    const choice = content.match(/^(choice|select|tabs|radio)\s+([A-Za-z_][A-Za-z0-9_]*)(.*?)\s*:\s*$/);
    if (choice) {
      const decorators = visualDecorators(`choice${choice[3]}`, current.line);
      if (decorators.source !== "choice") throw new LumaError(`After a ${choice[1]} state, use only 'using style_name' or 'id element_name'.`, current.line);
      if (decorators.role) throw new LumaError("Choices can use styles and IDs, but not 'as' roles.", current.line);
      return { type: "choice", presentation: choice[1], state: choice[2], options: choiceOptionBlock(requiredChildIndent(currentIndent)), style: decorators.style, id: decorators.id, animation: decorators.animation, line: current.line };
    }
    const button = content.match(/^button\s+(.+)\s*:\s*$/);
    if (button) {
      const decorators = visualDecorators(button[1], current.line);
      return { type: "button", label: valueExpression(decorators.source, currentIndent, current.line), role: decorators.role ?? "primary", style: decorators.style, id: decorators.id, animation: decorators.animation, actions: block(requiredChildIndent(currentIndent)), line: current.line };
    }
    const submit = content.match(/^submit\s+(.+)\s*:\s*$/);
    if (submit) {
      const decorators = visualDecorators(submit[1], current.line);
      return { type: "button", event: "submit", label: valueExpression(decorators.source, currentIndent, current.line), role: decorators.role ?? "primary", style: decorators.style, id: decorators.id, animation: decorators.animation, actions: block(requiredChildIndent(currentIndent)), line: current.line };
    }
    const loop = content.match(/^for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\s+(.+):$/);
    if (loop) return { type: "for", name: loop[1], collection: valueExpression(loop[2], currentIndent, current.line), body: block(requiredChildIndent(currentIndent)), line: current.line };
    const navigation = content.match(/^go\s+([A-Za-z_][A-Za-z0-9_]*)$/);
    if (navigation) return { type: "go", screen: navigation[1], line: current.line };
    const actionCall = content.match(/^do\s+([A-Za-z_][A-Za-z0-9_]*)(?:\((.*)\))?$/);
    if (actionCall) {
      const args = actionCall[2] === undefined || !actionCall[2].trim() ? [] : parseExpression(`[${actionCall[2]}]`, current.line).values;
      return { type: "do", action: actionCall[1], args, line: current.line };
    }
    const request = content.match(/^request\s+([A-Za-z_][A-Za-z0-9_]*)\s+into\s+([A-Za-z_][A-Za-z0-9_]*)$/);
    if (request) return { type: "request", api: request[1], state: request[2], line: current.line };
    const returnValue = content.match(/^return\s+(.+)$/);
    if (returnValue) return { type: "return", value: valueExpression(returnValue[1], currentIndent, current.line), line: current.line };
    const show = content.match(/^show\s+(.+)$/);
    if (show) return { type: "show", value: valueExpression(show[1], currentIndent, current.line), line: current.line };
    const condition = content.match(/^if\s+(.+):$/);
    if (condition) {
      const then = block(requiredChildIndent(currentIndent));
      skipEmpty();
      let otherwise = [];
      if (position < lines.length && indentation(lines[position].text) === currentIndent && lines[position].text.trim() === "else:") {
        position += 1;
        otherwise = block(requiredChildIndent(currentIndent));
      }
      return { type: "if", condition: valueExpression(condition[1], currentIndent, current.line), then, otherwise, line: current.line };
    }
    if (content === "else:") throw new LumaError("'else:' must come immediately after an 'if' block.", current.line);
    throw new LumaError("I expected a Luma instruction at the start of this line.", current.line);
  }
  return { type: "program", statements: block(0) };
}

function readVariable(variables, name, line) {
  if (!variables.has(name)) throw new LumaError(`'${name}' has not been given a value yet.`, line);
  return variables.get(name);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function recordField(record, field, line) {
  if (!isRecord(record)) throw new LumaError(`'${field}' can only be read from a record.`, line);
  if (!Object.hasOwn(record, field)) throw new LumaError(`This record does not have a field named '${field}'.`, line);
  return record[field];
}

function equalValues(left, right) {
  if (left === right) return true;
  if (Array.isArray(left) && Array.isArray(right)) return left.length === right.length && left.every((value, index) => equalValues(value, right[index]));
  if (isRecord(left) && isRecord(right)) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    return leftKeys.length === rightKeys.length && leftKeys.every((key) => Object.hasOwn(right, key) && equalValues(left[key], right[key]));
  }
  return false;
}

function callBuiltin(name, args, line) {
  if (name === "length") {
    if (args.length !== 1) throw new LumaError("length() needs exactly one value.", line);
    if (!Array.isArray(args[0]) && typeof args[0] !== "string") throw new LumaError("length() needs text or a list.", line);
    return args[0].length;
  }
  if (name === "append") {
    if (args.length !== 2 || !Array.isArray(args[0])) throw new LumaError("append() needs a list and one new value.", line);
    return [...args[0], args[1]];
  }
  if (name === "remove") {
    if (args.length !== 2 || !Array.isArray(args[0])) throw new LumaError("remove() needs a list and one value.", line);
    return args[0].filter((item) => !equalValues(item, args[1]));
  }
  if (name === "contains") {
    if (args.length !== 2 || !Array.isArray(args[0])) throw new LumaError("contains() needs a list and one value.", line);
    return args[0].some((item) => equalValues(item, args[1]));
  }
  if (name === "first" || name === "last") {
    if (args.length !== 1 || !Array.isArray(args[0])) throw new LumaError(`${name}() needs one list.`, line);
    return args[0].length === 0 ? null : args[0][name === "first" ? 0 : args[0].length - 1];
  }
  if (name === "at") {
    if (args.length !== 2 || !Array.isArray(args[0]) || !Number.isInteger(args[1])) throw new LumaError("at() needs a list and a whole-number position.", line);
    return args[0][args[1]] ?? null;
  }
  if (name === "find_by" || name === "where") {
    if (args.length !== 3 || !Array.isArray(args[0]) || typeof args[1] !== "string") throw new LumaError(`${name}() needs a list, a quoted field name, and a value.`, line);
    const matches = args[0].filter((item) => isRecord(item) && equalValues(item[args[1]], args[2]));
    return name === "find_by" ? matches[0] ?? null : matches;
  }
  if (name === "sort_by") {
    if (args.length < 2 || args.length > 3 || !Array.isArray(args[0]) || typeof args[1] !== "string") throw new LumaError("sort_by() needs a list, a quoted field name, and optionally \"ascending\" or \"descending\".", line);
    const direction = args[2] ?? "ascending";
    if (direction !== "ascending" && direction !== "descending") throw new LumaError("sort_by() direction is \"ascending\" or \"descending\".", line);
    return [...args[0]].sort((left, right) => {
      const a = isRecord(left) ? left[args[1]] : undefined;
      const b = isRecord(right) ? right[args[1]] : undefined;
      if (a === b) return 0;
      const result = a > b ? 1 : -1;
      return direction === "ascending" ? result : -result;
    });
  }
  if (name === "replace") {
    if (args.length !== 3 || !Array.isArray(args[0])) throw new LumaError("replace() needs a list, its current value, and the replacement value.", line);
    let replaced = false;
    return args[0].map((item) => {
      if (!replaced && equalValues(item, args[1])) {
        replaced = true;
        return args[2];
      }
      return item;
    });
  }
  if (name === "field") {
    if (args.length !== 2 || !isRecord(args[0]) || typeof args[1] !== "string") throw new LumaError("field() needs a record and a quoted field name.", line);
    return recordField(args[0], args[1], line);
  }
  if (name === "fields") {
    if (args.length !== 1 || !isRecord(args[0])) throw new LumaError("fields() needs one record.", line);
    return Object.keys(args[0]);
  }
  return undefined;
}

function runFunction(functionDeclaration, args, context, line) {
  if (functionDeclaration.parameters.length !== args.length) {
    throw new LumaError(`'${functionDeclaration.name}' needs ${functionDeclaration.parameters.length} value${functionDeclaration.parameters.length === 1 ? "" : "s"}.`, line);
  }
  if (context.callStack.includes(functionDeclaration.name)) throw new LumaError(`The function '${functionDeclaration.name}' keeps calling itself.`, line);
  const localVariables = new Map(context.variables);
  functionDeclaration.parameters.forEach((name, index) => localVariables.set(name, args[index]));
  const localContext = { ...context, variables: localVariables, callStack: [...context.callStack, functionDeclaration.name] };
  function run(block) {
    for (const statement of block) {
      if (statement.type === "let" || statement.type === "value") {
        localVariables.set(statement.name, evaluate(statement.value, localContext, statement.line));
        continue;
      }
      if (statement.type === "if") {
        const returned = run(evaluate(statement.condition, localContext, statement.line) ? statement.then : statement.otherwise);
        if (returned) return returned;
        continue;
      }
      if (statement.type === "return") return { returned: true, value: evaluate(statement.value, localContext, statement.line) };
      throw new LumaError("A function can contain 'value', 'let', 'if', and 'return'.", statement.line);
    }
    return null;
  }
  const result = run(functionDeclaration.body);
  if (!result) throw new LumaError(`The function '${functionDeclaration.name}' needs to return a value.`, functionDeclaration.line);
  return result.value;
}

function evaluate(expression, context, line) {
  if (expression.type === "literal") return expression.value;
  if (expression.type === "list") return expression.values.map((value) => evaluate(value, context, line));
  if (expression.type === "record") return Object.fromEntries(expression.fields.map((field) => [field.name, evaluate(field.value, context, line)]));
  if (expression.type === "name") return readVariable(context.variables, expression.value, line);
  if (expression.type === "field") return recordField(evaluate(expression.record, context, line), expression.name, line);
  if (expression.type === "merge") {
    const record = evaluate(expression.record, context, line);
    const update = evaluate(expression.update, context, line);
    if (!isRecord(record) || !isRecord(update)) throw new LumaError("'with' combines one record with another record.", line);
    return { ...record, ...update };
  }
  if (expression.type === "call") {
    const args = expression.args.map((value) => evaluate(value, context, line));
    const builtin = callBuiltin(expression.name, args, line);
    if (builtin !== undefined) return builtin;
    const fn = context.functions.get(expression.name);
    if (!fn) throw new LumaError(`There is no function named '${expression.name}'.`, line);
    return runFunction(fn, args, context, line);
  }
  if (expression.type === "unary") {
    const value = evaluate(expression.value, context, line);
    return expression.operator === "-" ? -value : !value;
  }
  const left = evaluate(expression.left, context, line);
  if (expression.operator === "and") return left && evaluate(expression.right, context, line);
  if (expression.operator === "or") return left || evaluate(expression.right, context, line);
  const right = evaluate(expression.right, context, line);
  switch (expression.operator) {
    case "+": return left + right;
    case "-": return left - right;
    case "*": return left * right;
    case "/": return left / right;
    case "==": return equalValues(left, right);
    case "!=": return !equalValues(left, right);
    case ">": return left > right;
    case ">=": return left >= right;
    case "<": return left < right;
    case "<=": return left <= right;
    default: throw new LumaError(`The operator '${expression.operator}' is not ready yet.`, line);
  }
}

function declarationMap(program, type, description) {
  const result = new Map();
  for (const declaration of program.statements.filter((statement) => statement.type === type)) {
    if (result.has(declaration.name)) throw new LumaError(`There is already a ${description} named '${declaration.name}'.`, declaration.line);
    result.set(declaration.name, declaration);
  }
  return result;
}

function contextFor(variables, functions) {
  return { variables, functions, callStack: [] };
}

function validateStyleValues(style, declaration) {
  for (const [name, value] of Object.entries(style)) {
    if (COLOR_STYLE_SETTINGS.has(name) && typeof value !== "string") {
      throw new LumaError(`Style setting '${name}' needs text such as "#2563eb".`, declaration.line);
    }
    if (NUMBER_STYLE_SETTINGS.has(name) && (typeof value !== "number" || !Number.isFinite(value))) {
      throw new LumaError(`Style setting '${name}' needs a number.`, declaration.line);
    }
    if (TEXT_STYLE_SETTINGS.has(name) && typeof value !== "string") throw new LumaError(`Style setting '${name}' needs text.`, declaration.line);
    if (BOOLEAN_STYLE_SETTINGS.has(name) && typeof value !== "boolean") throw new LumaError(`Style setting '${name}' needs true or false.`, declaration.line);
    if (["opacity"].includes(name) && (value < 0 || value > 1)) throw new LumaError(`Style setting '${name}' must be between 0 and 1.`, declaration.line);
    if (["scale", "hover_scale", "press_scale", "line_height", "aspect_ratio"].includes(name) && value <= 0) throw new LumaError(`Style setting '${name}' must be greater than 0.`, declaration.line);
    if (name === "columns" && (!Number.isInteger(value) || value < 1)) throw new LumaError("Style setting 'columns' needs a whole number of 1 or more.", declaration.line);
    if (["gradient", "shadow", "font", "text_align", "align", "justify", "overflow"].includes(name)) {
      const choices = {
        gradient: ["none", "horizontal", "vertical", "diagonal"], shadow: ["none", "small", "medium", "large", "glow"],
        font: ["system", "rounded", "serif", "mono"], text_align: ["left", "center", "right"],
        align: ["start", "center", "end", "stretch"], justify: ["start", "center", "end", "between", "around", "evenly"], overflow: ["visible", "clip"],
      };
      if (!choices[name].includes(value)) throw new LumaError(`Style setting '${name}' can be ${choices[name].join(", ")}.`, declaration.line);
    }
  }
}

function validateAnimationValues(animation, declaration) {
  const effects = ["fade", "fade_up", "fade_down", "slide_left", "slide_right", "scale", "pop", "pulse", "spin"];
  const easings = ["linear", "ease", "ease_in", "ease_out", "ease_in_out"];
  if (!effects.includes(animation.effect)) throw new LumaError(`Animation '${declaration.name}' needs an effect such as "fade_up".`, declaration.line);
  if (!easings.includes(animation.easing)) throw new LumaError(`Animation '${declaration.name}' has an unknown easing.`, declaration.line);
  for (const name of ["duration", "delay", "stagger"]) {
    if (typeof animation[name] !== "number" || !Number.isFinite(animation[name]) || animation[name] < 0) throw new LumaError(`Animation setting '${name}' needs a positive number.`, declaration.line);
  }
  if (!(animation.repeat === "forever" || (Number.isInteger(animation.repeat) && animation.repeat >= 1))) throw new LumaError("Animation repeat needs a whole number or \"forever\".", declaration.line);
}

function designStyle(values, declaration, theme) {
  const semantic = {};
  const style = {};
  const recipes = {
    intent: {
      primary: { intent: "primary", accent: theme.accent, accent_text: theme.accent_text },
      secondary: { intent: "secondary", surface: theme.surface, text: theme.text, outline: theme.outline },
      quiet: { intent: "quiet", surface: theme.canvas, text: theme.muted, outline: theme.canvas },
      danger: { intent: "danger", accent: "#dc2626", accent_text: "#ffffff", focus_outline: "#fca5a5" },
      success: { intent: "success", accent: "#059669", accent_text: "#ffffff", focus_outline: "#6ee7b7" },
    },
    feel: {
      confident: { radius: 14, shadow: "medium", hover_lift: 2 },
      soft: { radius: 24, shadow: "small", hover_lift: 1 },
      crisp: { radius: 6, shadow: "none", outline_width: 1 },
      playful: { radius: 999, shadow: "medium", hover_lift: 3 },
    },
    size: {
      compact: { padding_x: 14, padding_y: 9, font_size: 14 },
      comfortable: { padding_x: 20, padding_y: 13, font_size: 15 },
      generous: { padding_x: 26, padding_y: 17, font_size: 17 },
    },
    emphasis: {
      low: { opacity: 0.82, font_weight: 500 },
      medium: { opacity: 1, font_weight: 650 },
      high: { opacity: 1, font_weight: 760, shadow: "medium" },
    },
    motion: {
      none: { transition: 0, hover_scale: 1, press_scale: 1 },
      gentle: { transition: 220, hover_scale: 1.01, press_scale: 0.99 },
      spring: { transition: 140, hover_scale: 1.035, hover_lift: 3, press_scale: 0.96 },
    },
    mood: {
      calm: { surface: "#f8fafc", outline: "#dbe4ef", text: "#1e293b", muted: "#64748b" },
      vivid: { surface: "#fdf4ff", outline: "#f0abfc", text: "#4a044e", muted: "#86198f" },
      midnight: { surface: "#101827", outline: "#334155", text: "#e2e8f0", muted: "#94a3b8" },
      warm: { surface: "#fff7ed", outline: "#fed7aa", text: "#431407", muted: "#9a3412" },
    },
    density: {
      compact: { gap: 10, padding: 12, margin_bottom: 10 },
      standard: { gap: 16, padding: 16, margin_bottom: 16 },
      airy: { gap: 24, padding: 26, margin_bottom: 24 },
    },
  };
  for (const setting of values) {
    if (!DESIGN_SETTINGS.has(setting.name)) throw new LumaError(`'${setting.name}' is not a known design setting.`, setting.line);
    const value = evaluate(setting.value, declaration.context, setting.line);
    if (typeof value !== "string" || !DESIGN_CHOICES[setting.name].includes(value)) {
      throw new LumaError(`Design setting '${setting.name}' can be ${DESIGN_CHOICES[setting.name].join(", ")}.`, setting.line);
    }
    semantic[setting.name] = value;
    Object.assign(style, recipes[setting.name][value]);
  }
  return { semantic, style };
}

function componentContext(element, components, context) {
  const component = components.get(element.name);
  if (!component) throw new LumaError(`There is no component named '${element.name}'.`, element.line);
  if (component.parameters.length !== element.args.length) {
    throw new LumaError(`Component '${element.name}' needs ${component.parameters.length} value${component.parameters.length === 1 ? "" : "s"}.`, element.line);
  }
  const variables = new Map(context.variables);
  component.parameters.forEach((name, index) => variables.set(name, evaluate(element.args[index], context, element.line)));
  return { component, context: { ...context, variables } };
}

function validateVisualElements(elements, styles, animations, components, ids = new Set(), insideLoop = false, componentStack = []) {
  for (const element of elements) {
    if (element.style && !styles.has(element.style)) throw new LumaError(`There is no style named '${element.style}'.`, element.line);
    if (element.animation && !animations.has(element.animation)) throw new LumaError(`There is no animation named '${element.animation}'.`, element.line);
    if (element.id) {
      if (insideLoop) throw new LumaError(`'${element.id}' is inside a 'for' loop, so it would be repeated. Give repeated elements no ID.`, element.line);
      if (ids.has(element.id)) throw new LumaError(`There is already an element with id '${element.id}'.`, element.line);
      ids.add(element.id);
    }
    if (element.type === "layout") validateVisualElements(element.body, styles, animations, components, ids, insideLoop, componentStack);
    else if (element.type === "if") {
      validateVisualElements(element.then, styles, animations, components, ids, insideLoop, componentStack);
      validateVisualElements(element.otherwise, styles, animations, components, ids, insideLoop, componentStack);
    } else if (element.type === "for") validateVisualElements(element.body, styles, animations, components, ids, true, componentStack);
    else if (element.type === "use") {
      const component = components.get(element.name);
      if (!component) throw new LumaError(`There is no component named '${element.name}'.`, element.line);
      if (component.parameters.length !== element.args.length) throw new LumaError(`Component '${element.name}' needs ${component.parameters.length} value${component.parameters.length === 1 ? "" : "s"}.`, element.line);
      if (componentStack.includes(element.name)) throw new LumaError(`Component '${element.name}' keeps using itself.`, element.line);
      validateVisualElements(component.body, styles, animations, components, ids, insideLoop, [...componentStack, element.name]);
    }
  }
}

function execute(program, { output = console.log } = {}) {
  const parsed = typeof program === "string" ? parse(program) : program;
  const variables = new Map();
  const functions = declarationMap(parsed, "function", "function");
  const context = contextFor(variables, functions);
  function run(statements) {
    for (const statement of statements) {
      if (["let", "value", "state", "remember", "data", "set"].includes(statement.type)) variables.set(statement.name, evaluate(statement.value, context, statement.line));
      else if (statement.type === "show") output(String(evaluate(statement.value, context, statement.line)));
      else if (statement.type === "if") run(evaluate(statement.condition, context, statement.line) ? statement.then : statement.otherwise);
      else if (["app", "theme", "style", "design", "animation", "api", "screen", "component", "action", "function"].includes(statement.type)) continue;
      else throw new LumaError(`'${statement.type}' only makes sense inside a visual app.`, statement.line);
    }
  }
  run(parsed.statements);
  return variables;
}

function run(source, options) {
  return execute(parse(source), options);
}

function parseStored(raw) {
  if (!raw) return {};
  try {
    const value = JSON.parse(raw);
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function appDefinition(source, storage = null, data = null) {
  const program = typeof source === "string" ? parse(source) : source;
  const declaration = program.statements.find((statement) => statement.type === "app");
  if (!declaration) throw new LumaError("A visual Luma program starts with an app declaration.");
  const variables = new Map();
  const functions = declarationMap(program, "function", "function");
  const actions = declarationMap(program, "action", "action");
  const apis = declarationMap(program, "api", "api");
  const components = declarationMap(program, "component", "component");
  const styleDeclarations = program.statements.filter((statement) => statement.type === "style");
  const designDeclarations = program.statements.filter((statement) => statement.type === "design");
  const animationDeclarations = declarationMap(program, "animation", "animation");
  const stateNames = new Set();
  const rememberedNames = new Set();
  const dataNames = new Set();
  const dataSources = new Map();
  const context = contextFor(variables, functions);
  for (const statement of program.statements) {
    if (["let", "value", "state", "remember", "data"].includes(statement.type)) {
      variables.set(statement.name, evaluate(statement.value, context, statement.line));
      if (statement.type === "state" || statement.type === "remember" || statement.type === "data") stateNames.add(statement.name);
      if (statement.type === "remember") rememberedNames.add(statement.name);
      if (statement.type === "data") {
        const sourceName = evaluate(statement.source, context, statement.line);
        if (typeof sourceName !== "string") throw new LumaError("A data source needs text such as \"tasks\".", statement.line);
        if (dataNames.has(statement.name)) throw new LumaError(`There is already data named '${statement.name}'.`, statement.line);
        dataNames.add(statement.name);
        dataSources.set(statement.name, sourceName);
        const savedValue = data?.read ? data.read(sourceName) : undefined;
        if (savedValue !== undefined && savedValue !== null) variables.set(statement.name, savedValue);
      }
    }
  }
  const name = String(evaluate(declaration.name, context, declaration.line));
  const storageKey = `luma:${name}:state`;
  const saved = storage?.read ? parseStored(storage.read(storageKey)) : {};
  for (const remembered of rememberedNames) {
    if (Object.hasOwn(saved, remembered)) variables.set(remembered, saved[remembered]);
  }
  const apiSources = new Map();
  for (const api of apis.values()) {
    const sourceName = evaluate(api.source, context, api.line);
    if (typeof sourceName !== "string") throw new LumaError(`API '${api.name}' needs a text URL or source name.`, api.line);
    apiSources.set(api.name, sourceName);
  }
  const themeDeclaration = program.statements.find((statement) => statement.type === "theme");
  const theme = { ...DEFAULT_THEME };
  if (themeDeclaration) {
    for (const setting of themeDeclaration.values) {
      if (!Object.hasOwn(DEFAULT_THEME, setting.name)) throw new LumaError(`'${setting.name}' is not a known theme setting.`, setting.line);
      theme[setting.name] = evaluate(setting.value, context, setting.line);
    }
  }
  for (const color of ["accent", "accent_text", "canvas", "surface", "text", "muted", "outline"]) {
    if (typeof theme[color] !== "string") throw new LumaError(`Theme setting '${color}' needs text such as "#2563eb".`, themeDeclaration?.line);
  }
  for (const measure of ["spacing", "radius", "width", "min_width", "max_width", "font_size", "line_height", "motion"]) {
    if (typeof theme[measure] !== "number") throw new LumaError(`Theme setting '${measure}' needs a number.`, themeDeclaration?.line);
  }
  if (!["system", "rounded", "serif", "mono"].includes(theme.font)) throw new LumaError("Theme setting 'font' can be system, rounded, serif, or mono.", themeDeclaration?.line);
  if (theme.min_width <= 0 || theme.max_width < theme.min_width || theme.width < theme.min_width) throw new LumaError("Theme widths need a sensible min_width, width, and max_width.", themeDeclaration?.line);
  if (theme.motion < 0) throw new LumaError("Theme setting 'motion' cannot be negative.", themeDeclaration?.line);
  const animations = new Map();
  for (const declaration of animationDeclarations.values()) {
    const values = { effect: "fade", duration: 400, delay: 0, easing: "ease_out", repeat: 1, stagger: 0 };
    for (const setting of declaration.values) {
      if (!ANIMATION_SETTINGS.has(setting.name)) throw new LumaError(`'${setting.name}' is not a known animation setting.`, setting.line);
      values[setting.name] = evaluate(setting.value, context, setting.line);
    }
    validateAnimationValues(values, declaration);
    animations.set(declaration.name, values);
  }
  const styles = new Map();
  const idStyles = new Map();
  for (const declaration of styleDeclarations) {
    const target = declaration.targetId ? idStyles : styles;
    if (target.has(declaration.name)) {
      throw new LumaError(`There is already a ${declaration.targetId ? "targeted" : "named"} style for '${declaration.name}'.`, declaration.line);
    }
    const values = {};
    for (const setting of declaration.values) {
      if (!STYLE_SETTINGS.has(setting.name)) throw new LumaError(`'${setting.name}' is not a known style setting.`, setting.line);
      values[setting.name] = evaluate(setting.value, context, setting.line);
    }
    validateStyleValues(values, declaration);
    target.set(declaration.name, values);
  }
  const designs = new Map();
  for (const declaration of designDeclarations) {
    if (styles.has(declaration.name) || idStyles.has(declaration.name)) throw new LumaError(`There is already a style or design named '${declaration.name}'.`, declaration.line);
    const { semantic, style } = designStyle(declaration.values, { ...declaration, context }, theme);
    designs.set(declaration.name, semantic);
    styles.set(declaration.name, style);
  }
  const screens = program.statements.filter((statement) => statement.type === "screen");
  if (screens.length === 0) throw new LumaError("An app needs at least one screen.", declaration.line);
  const names = new Set();
  const ids = new Set();
  for (const screen of screens) {
    if (names.has(screen.name)) throw new LumaError(`There is already a screen named '${screen.name}'.`, screen.line);
    names.add(screen.name);
    validateVisualElements(screen.body, styles, animations, components, ids);
  }
  for (const id of idStyles.keys()) {
    if (!ids.has(id)) throw new LumaError(`There is no element with id '${id}' for this targeted style.`, program.statements.find((statement) => statement.type === "style" && statement.targetId === id)?.line);
  }
  function validateActionRequests(actionsToCheck) {
    for (const action of actionsToCheck) {
      if (action.type === "request") {
        if (!apiSources.has(action.api)) throw new LumaError(`There is no API named '${action.api}'.`, action.line);
        if (!stateNames.has(action.state)) throw new LumaError(`'${action.state}' needs state, remember, or data before an API can write into it.`, action.line);
      } else if (action.type === "if") {
        validateActionRequests(action.then);
        validateActionRequests(action.otherwise);
      }
    }
  }
  for (const action of actions.values()) validateActionRequests(action.actions);
  for (const screen of screens) {
    const verifyButtons = (elements) => elements.forEach((element) => {
      if (element.type === "button") validateActionRequests(element.actions);
      else if (element.type === "layout" || element.type === "for") verifyButtons(element.body);
      else if (element.type === "if") { verifyButtons(element.then); verifyButtons(element.otherwise); }
      else if (element.type === "use") verifyButtons(components.get(element.name).body);
    });
    verifyButtons(screen.body);
  }
  return { name, variables, functions, actions, apis: apiSources, components, stateNames, rememberedNames, dataNames, dataSources, screens, theme, styles, designs, idStyles, animations, storage, storageKey, data };
}

function styleFor(element, styles, idStyles) {
  return { ...(element.style ? styles.get(element.style) : {}), ...(element.id ? idStyles.get(element.id) : {}) };
}

function visualFor(element, styles, idStyles, animations) {
  const visual = { id: element.id, style: styleFor(element, styles, idStyles) };
  if (element.animation) visual.animation = { name: element.animation, ...animations.get(element.animation) };
  return visual;
}

function renderElements(elements, context, stateNames, styles, idStyles, animations, components) {
  const rendered = [];
  for (const element of elements) {
    if (element.type === "if") {
      rendered.push(...renderElements(evaluate(element.condition, context, element.line) ? element.then : element.otherwise, context, stateNames, styles, idStyles, animations, components));
      continue;
    }
    if (element.type === "for") {
      const values = evaluate(element.collection, context, element.line);
      if (!Array.isArray(values)) throw new LumaError("A 'for' loop needs a list after 'in'.", element.line);
      for (const value of values) {
        const loopVariables = new Map(context.variables);
        loopVariables.set(element.name, value);
        rendered.push(...renderElements(element.body, { ...context, variables: loopVariables }, stateNames, styles, idStyles, animations, components));
      }
      continue;
    }
    if (element.type === "use") {
      const used = componentContext(element, components, context);
      rendered.push(...renderElements(used.component.body, used.context, stateNames, styles, idStyles, animations, components));
      continue;
    }
    if (element.type === "layout") {
      rendered.push({ type: "layout", layout: element.layout, ...visualFor(element, styles, idStyles, animations), children: renderElements(element.body, context, stateNames, styles, idStyles, animations, components) });
      continue;
    }
    if (["title", "heading", "subtitle", "text", "paragraph", "label", "caption", "quote", "code", "badge", "icon"].includes(element.type)) {
      rendered.push({ type: element.type, content: String(evaluate(element.value, context, element.line)), role: element.role, ...visualFor(element, styles, idStyles, animations) });
      continue;
    }
    if (element.type === "link") {
      const target = evaluate(element.target, context, element.line);
      if (typeof target !== "string") throw new LumaError("A link target needs text.", element.line);
      rendered.push({ type: "link", label: String(evaluate(element.label, context, element.line)), target, role: element.role, ...visualFor(element, styles, idStyles, animations) });
      continue;
    }
    if (element.type === "image") {
      const source = evaluate(element.source, context, element.line);
      if (typeof source !== "string") throw new LumaError("An image source needs text.", element.line);
      rendered.push({ type: "image", source, alt: String(evaluate(element.alt, context, element.line)), ...visualFor(element, styles, idStyles, animations) });
      continue;
    }
    if (element.type === "progress") {
      const value = evaluate(element.value, context, element.line);
      const min = evaluate(element.min, context, element.line);
      const max = evaluate(element.max, context, element.line);
      if (![value, min, max].every((item) => typeof item === "number" && Number.isFinite(item)) || max <= min) throw new LumaError("Progress needs numbers and a maximum greater than its minimum.", element.line);
      rendered.push({ type: "progress", value, min, max, ...visualFor(element, styles, idStyles, animations) });
      continue;
    }
    if (element.type === "divider") {
      rendered.push({ type: "divider", ...visualFor(element, styles, idStyles, animations) });
      continue;
    }
    if (element.type === "spacer") {
      const size = evaluate(element.size, context, element.line);
      if (typeof size !== "number" || !Number.isFinite(size) || size < 0) throw new LumaError("A spacer size needs a positive number.", element.line);
      rendered.push({ type: "spacer", size, ...visualFor(element, styles, idStyles, animations) });
      continue;
    }
    if (element.type === "input") {
      if (!stateNames.has(element.state)) throw new LumaError(`The input '${element.state}' needs a matching state value.`, element.line);
      const current = readVariable(context.variables, element.state, element.line);
      if (element.inputType === "number" && typeof current !== "number") throw new LumaError(`The number input '${element.state}' needs number state.`, element.line);
      if (element.inputType !== "number" && typeof current !== "string") throw new LumaError(`The ${element.inputType} input '${element.state}' needs text state.`, element.line);
      rendered.push({ type: "input", inputType: element.inputType, state: element.state, label: String(evaluate(element.label, context, element.line)), current, ...visualFor(element, styles, idStyles, animations) });
      continue;
    }
    if (element.type === "slider") {
      if (!stateNames.has(element.state)) throw new LumaError(`The slider '${element.state}' needs a matching state value.`, element.line);
      const current = readVariable(context.variables, element.state, element.line);
      const min = evaluate(element.min, context, element.line);
      const max = evaluate(element.max, context, element.line);
      const step = element.step ? evaluate(element.step, context, element.line) : null;
      if (![current, min, max].every((value) => typeof value === "number") || (step !== null && typeof step !== "number") || min > max || (step !== null && step <= 0)) {
        throw new LumaError(`Slider '${element.state}' needs number state and a valid numeric range.`, element.line);
      }
      rendered.push({ type: "slider", state: element.state, label: String(evaluate(element.label, context, element.line)), current, min, max, step, ...visualFor(element, styles, idStyles, animations) });
      continue;
    }
    if (element.type === "toggle") {
      if (!stateNames.has(element.state)) throw new LumaError(`The toggle '${element.state}' needs a matching state value.`, element.line);
      const current = readVariable(context.variables, element.state, element.line);
      if (typeof current !== "boolean") throw new LumaError(`The toggle '${element.state}' needs true or false state.`, element.line);
      rendered.push({ type: "toggle", state: element.state, label: String(evaluate(element.label, context, element.line)), current, ...visualFor(element, styles, idStyles, animations) });
      continue;
    }
    if (element.type === "choice") {
      if (!stateNames.has(element.state)) throw new LumaError(`The choice '${element.state}' needs a matching state value.`, element.line);
      rendered.push({ type: "choice", presentation: element.presentation ?? "choice", state: element.state, current: readVariable(context.variables, element.state, element.line), options: element.options.map((option) => option.value), ...visualFor(element, styles, idStyles, animations) });
      continue;
    }
    if (element.type === "button") {
      rendered.push({ type: "button", label: String(evaluate(element.label, context, element.line)), role: element.role, event: element.event ?? "press", ...visualFor(element, styles, idStyles, animations), actions: element.actions.map((action) => action.type) });
      continue;
    }
    throw new LumaError("This is not yet a visual element Luma can place on a screen.", element.line);
  }
  return rendered;
}

function renderScreen(screen, definition) {
  return { name: screen.name, elements: renderElements(screen.body, contextFor(definition.variables, definition.functions), definition.stateNames, definition.styles, definition.idStyles, definition.animations, definition.components) };
}

function stateSnapshot(variables, stateNames) {
  return Object.fromEntries([...stateNames].map((name) => [name, variables.get(name)]));
}

function buildApp(source, options = {}) {
  const definition = appDefinition(source, options.storage, options.data);
  return { name: definition.name, state: stateSnapshot(definition.variables, definition.stateNames), remembered: [...definition.rememberedNames], data: [...definition.dataNames], apis: Object.fromEntries(definition.apis), theme: definition.theme, styles: Object.fromEntries(definition.styles), designs: Object.fromEntries(definition.designs), idStyles: Object.fromEntries(definition.idStyles), animations: Object.fromEntries(definition.animations), screens: definition.screens.map((screen) => renderScreen(screen, definition)) };
}

function findInteractive(elements, type, match, context, components) {
  for (const element of elements) {
    if (element.type === "if") {
      const result = findInteractive(evaluate(element.condition, context, element.line) ? element.then : element.otherwise, type, match, context, components);
      if (result) return result;
      continue;
    }
    if (element.type === "for") {
      const values = evaluate(element.collection, context, element.line);
      if (!Array.isArray(values)) throw new LumaError("A 'for' loop needs a list after 'in'.", element.line);
      for (const value of values) {
        const variables = new Map(context.variables);
        variables.set(element.name, value);
        const result = findInteractive(element.body, type, match, { ...context, variables }, components);
        if (result) return result;
      }
      continue;
    }
    if (element.type === "layout") {
      const result = findInteractive(element.body, type, match, context, components);
      if (result) return result;
      continue;
    }
    if (element.type === "use") {
      const used = componentContext(element, components, context);
      const result = findInteractive(used.component.body, type, match, used.context, components);
      if (result) return result;
      continue;
    }
    if (element.type === type && match(element, context)) return { element, context };
  }
  return null;
}

function createAppRuntime(source, { output = console.log, storage = null, data = null, fetcher = null } = {}) {
  const definition = appDefinition(source, storage, data);
  let currentScreen = definition.screens[0];
  const context = () => contextFor(definition.variables, definition.functions);
  function persist() {
    if (!definition.storage?.write || definition.rememberedNames.size === 0) return;
    const saved = Object.fromEntries([...definition.rememberedNames].map((name) => [name, definition.variables.get(name)]));
    definition.storage.write(definition.storageKey, JSON.stringify(saved));
  }
  function updateState(name, value, line) {
    if (!definition.stateNames.has(name)) throw new LumaError(`Only declared state can be changed. '${name}' needs a state declaration.`, line);
    definition.variables.set(name, value);
    if (definition.rememberedNames.has(name)) persist();
    if (definition.dataNames.has(name) && definition.data?.write) definition.data.write(definition.dataSources.get(name), value);
  }
  function view() {
    return { name: definition.name, state: stateSnapshot(definition.variables, definition.stateNames), remembered: [...definition.rememberedNames], data: [...definition.dataNames], apis: Object.fromEntries(definition.apis), theme: definition.theme, designs: Object.fromEntries(definition.designs), animations: Object.fromEntries(definition.animations), screen: renderScreen(currentScreen, definition) };
  }
  function enteredValue(element, value) {
    const inputType = element.type === "slider" ? "slider" : element.inputType;
    if (inputType === "number" || inputType === "slider") {
      const number = typeof value === "number" ? value : Number(value);
      if (!Number.isFinite(number)) throw new LumaError(`The ${inputType} '${element.state}' needs a number.`, element.line);
      if (inputType === "slider") {
        const min = evaluate(element.min, context(), element.line);
        const max = evaluate(element.max, context(), element.line);
        const step = element.step ? evaluate(element.step, context(), element.line) : null;
        if (number < min || number > max) throw new LumaError(`The slider '${element.state}' must be between ${min} and ${max}.`, element.line);
        if (step && Math.abs((number - min) / step - Math.round((number - min) / step)) > 0.000001) throw new LumaError(`The slider '${element.state}' moves in steps of ${step}.`, element.line);
      }
      return number;
    }
    if (inputType === "date") {
      if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) throw new LumaError(`The date '${element.state}' needs YYYY-MM-DD text.`, element.line);
      return value;
    }
    if (inputType === "email" && (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) throw new LumaError(`The email '${element.state}' needs an address such as name@example.com.`, element.line);
    if (inputType === "color" && (typeof value !== "string" || !/^#[0-9a-fA-F]{6}$/.test(value))) throw new LumaError(`The color '${element.state}' needs six-digit text such as #2563eb.`, element.line);
    if (inputType === "time" && (typeof value !== "string" || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value))) throw new LumaError(`The time '${element.state}' needs 24-hour text such as 09:30.`, element.line);
    if (typeof value !== "string") throw new LumaError(`The ${inputType === "textarea" ? "textarea" : "input"} '${element.state}' needs text.`, element.line);
    return value;
  }
  function inputOnScreen(state) {
    return findInteractive(currentScreen.body, "input", (element) => element.state === state, context(), definition.components)
      ?? findInteractive(currentScreen.body, "slider", (element) => element.state === state, context(), definition.components);
  }
  function choose(state, option) {
    const found = findInteractive(currentScreen.body, "choice", (element) => element.state === state, context(), definition.components);
    if (!found) throw new LumaError(`The current screen does not offer a choice named '${state}'.`);
    const { element: choice } = found;
    if (!choice.options.map((item) => item.value).includes(option)) throw new LumaError(`'${option}' is not an option for '${state}'.`, choice.line);
    updateState(state, option, choice.line);
    return view();
  }
  function enter(state, value) {
    const found = inputOnScreen(state);
    if (!found) throw new LumaError(`The current screen does not offer an input named '${state}'.`);
    const { element: input } = found;
    updateState(state, enteredValue(input, value), input.line);
    return view();
  }
  function toggle(state) {
    const found = findInteractive(currentScreen.body, "toggle", (element) => element.state === state, context(), definition.components);
    if (!found) throw new LumaError(`The current screen does not offer a toggle named '${state}'.`);
    const { element } = found;
    const current = definition.variables.get(state);
    if (typeof current !== "boolean") throw new LumaError(`The toggle '${state}' needs true or false state.`, element.line);
    updateState(state, !current, element.line);
    return view();
  }
  function runActions(actions, executionContext = context(), callStack = []) {
    for (const action of actions) {
      if (action.type === "set") {
        const value = evaluate(action.value, executionContext, action.line);
        updateState(action.name, value, action.line);
        executionContext.variables.set(action.name, value);
        continue;
      }
      if (action.type === "let" || action.type === "value") {
        executionContext.variables.set(action.name, evaluate(action.value, executionContext, action.line));
        continue;
      }
      if (action.type === "show") {
        output(String(evaluate(action.value, executionContext, action.line)));
        continue;
      }
      if (action.type === "if") {
        runActions(evaluate(action.condition, executionContext, action.line) ? action.then : action.otherwise, executionContext, callStack);
        continue;
      }
      if (action.type === "do") {
        const reusableAction = definition.actions.get(action.action);
        if (!reusableAction) throw new LumaError(`There is no action named '${action.action}'.`, action.line);
        if (callStack.includes(action.action)) throw new LumaError(`The action '${action.action}' keeps calling itself.`, action.line);
        if (reusableAction.parameters.length !== action.args.length) {
          throw new LumaError(`'${action.action}' needs ${reusableAction.parameters.length} value${reusableAction.parameters.length === 1 ? "" : "s"}.`, action.line);
        }
        const localVariables = new Map(executionContext.variables);
        reusableAction.parameters.forEach((name, index) => localVariables.set(name, evaluate(action.args[index], executionContext, action.line)));
        runActions(reusableAction.actions, { ...executionContext, variables: localVariables }, [...callStack, action.action]);
        continue;
      }
      if (action.type === "request") {
        throw new LumaError(`'request ${action.api}' is asynchronous. Use pressAsync() to run this action.`, action.line);
      }
      if (action.type === "go") {
        const target = definition.screens.find((screen) => screen.name === action.screen);
        if (!target) throw new LumaError(`There is no screen named '${action.screen}'.`, action.line);
        currentScreen = target;
        continue;
      }
      throw new LumaError("An action can be 'set', 'show', 'if', 'value', 'let', 'do', 'request', or 'go'.", action.line);
    }
  }
  function press(label) {
    const found = findInteractive(currentScreen.body, "button", (element, buttonContext) => String(evaluate(element.label, buttonContext, element.line)) === label, context(), definition.components);
    if (!found) throw new LumaError(`The current screen has no button labelled '${label}'.`);
    runActions(found.element.actions, found.context);
    return view();
  }
  function byId(id, type) {
    const types = Array.isArray(type) ? type : [type];
    const found = types.map((candidate) => findInteractive(currentScreen.body, candidate, (element) => element.id === id, context(), definition.components)).find(Boolean);
    if (!found) throw new LumaError(`The current screen has no ${types.join(" or ")} with id '${id}'.`);
    return found;
  }
  function pressId(id) {
    const found = byId(id, "button");
    runActions(found.element.actions, found.context);
    return view();
  }
  function enterId(id, value) {
    const found = byId(id, ["input", "slider"]);
    updateState(found.element.state, enteredValue(found.element, value), found.element.line);
    return view();
  }
  function chooseId(id, option) {
    const found = byId(id, "choice");
    if (!found.element.options.map((item) => item.value).includes(option)) throw new LumaError(`'${option}' is not an option for '${found.element.state}'.`, found.element.line);
    updateState(found.element.state, option, found.element.line);
    return view();
  }
  function toggleId(id) {
    const found = byId(id, "toggle");
    const current = definition.variables.get(found.element.state);
    if (typeof current !== "boolean") throw new LumaError(`The toggle '${found.element.state}' needs true or false state.`, found.element.line);
    updateState(found.element.state, !current, found.element.line);
    return view();
  }
  async function runActionsAsync(actions, executionContext = context(), callStack = []) {
    for (const action of actions) {
      if (action.type === "set") {
        const value = evaluate(action.value, executionContext, action.line);
        updateState(action.name, value, action.line);
        executionContext.variables.set(action.name, value);
        continue;
      }
      if (action.type === "let" || action.type === "value") {
        executionContext.variables.set(action.name, evaluate(action.value, executionContext, action.line));
        continue;
      }
      if (action.type === "show") {
        output(String(evaluate(action.value, executionContext, action.line)));
        continue;
      }
      if (action.type === "if") {
        await runActionsAsync(evaluate(action.condition, executionContext, action.line) ? action.then : action.otherwise, executionContext, callStack);
        continue;
      }
      if (action.type === "do") {
        const reusableAction = definition.actions.get(action.action);
        if (!reusableAction) throw new LumaError(`There is no action named '${action.action}'.`, action.line);
        if (callStack.includes(action.action)) throw new LumaError(`The action '${action.action}' keeps calling itself.`, action.line);
        if (reusableAction.parameters.length !== action.args.length) throw new LumaError(`'${action.action}' needs ${reusableAction.parameters.length} value${reusableAction.parameters.length === 1 ? "" : "s"}.`, action.line);
        const localVariables = new Map(executionContext.variables);
        reusableAction.parameters.forEach((name, index) => localVariables.set(name, evaluate(action.args[index], executionContext, action.line)));
        await runActionsAsync(reusableAction.actions, { ...executionContext, variables: localVariables }, [...callStack, action.action]);
        continue;
      }
      if (action.type === "request") {
        if (!fetcher) throw new LumaError("This app needs a fetcher host before it can make an API request.", action.line);
        const sourceName = definition.apis.get(action.api);
        if (!sourceName) throw new LumaError(`There is no API named '${action.api}'.`, action.line);
        const value = await fetcher(sourceName, { api: action.api, app: definition.name });
        updateState(action.state, value, action.line);
        executionContext.variables.set(action.state, value);
        continue;
      }
      if (action.type === "go") {
        const target = definition.screens.find((screen) => screen.name === action.screen);
        if (!target) throw new LumaError(`There is no screen named '${action.screen}'.`, action.line);
        currentScreen = target;
        continue;
      }
      throw new LumaError("An action can be 'set', 'show', 'if', 'value', 'let', 'do', 'request', or 'go'.", action.line);
    }
  }
  async function pressAsync(label) {
    const found = findInteractive(currentScreen.body, "button", (element, buttonContext) => String(evaluate(element.label, buttonContext, element.line)) === label, context(), definition.components);
    if (!found) throw new LumaError(`The current screen has no button labelled '${label}'.`);
    await runActionsAsync(found.element.actions, found.context);
    return view();
  }
  async function pressIdAsync(id) {
    const found = byId(id, "button");
    await runActionsAsync(found.element.actions, found.context);
    return view();
  }
  return { choose, enter, toggle, press, pressAsync, chooseId, enterId, toggleId, pressId, pressIdAsync, view };
}

function previewElements(elements, lines, indent) {
  for (const element of elements) {
    const prefix = " ".repeat(indent);
    if (["title", "heading", "subtitle", "text", "paragraph", "label", "caption", "quote", "code", "badge", "icon"].includes(element.type)) lines.push(`${prefix}${element.content}`);
    else if (element.type === "link") lines.push(`${prefix}${element.label} -> ${element.target}`);
    else if (element.type === "image") lines.push(`${prefix}[ image: ${element.alt} ]`);
    else if (element.type === "progress") lines.push(`${prefix}Progress: ${element.value} from ${element.min} to ${element.max}`);
    else if (element.type === "divider") lines.push(`${prefix}${"-".repeat(24)}`);
    else if (element.type === "spacer") lines.push(`${prefix}[ ${element.size}px space ]`);
    else if (element.type === "input") lines.push(`${prefix}${element.label}: [${element.current}]`);
    else if (element.type === "slider") lines.push(`${prefix}${element.label}: [${element.current} from ${element.min} to ${element.max}]`);
    else if (element.type === "toggle") lines.push(`${prefix}${element.label}: [${element.current ? "on" : "off"}]`);
    else if (element.type === "choice") {
      lines.push(`${prefix}Choose ${element.state} (current: ${element.current})`);
      for (const option of element.options) lines.push(`${prefix}  ( ) ${option}`);
    } else if (element.type === "button") lines.push(`${prefix}[ ${element.label} ]`);
    else if (element.type === "layout") {
      lines.push(`${prefix}${element.layout}:`);
      previewElements(element.children, lines, indent + 2);
    }
  }
}

function previewApp(app) {
  const lines = [`Luma app: ${app.name}`];
  const screens = app.screen ? [app.screen] : app.screens;
  for (const screen of screens) {
    lines.push("", `Screen: ${screen.name}`);
    previewElements(screen.elements, lines, 2);
  }
  return lines.join("\n");
}


function browserStorage(prefix) {
  const available = typeof window !== "undefined" && window.localStorage;
  return {
    read: (name) => available ? window.localStorage.getItem(`${prefix}:${name}`) : null,
    write: (name, value) => { if (available) window.localStorage.setItem(`${prefix}:${name}`, value); },
  };
}

function browserData() {
  const available = typeof window !== "undefined" && window.localStorage;
  return {
    read: (source) => {
      if (!available) return null;
      const raw = window.localStorage.getItem(`luma:data:${source}`);
      if (!raw) return null;
      try { return JSON.parse(raw); } catch { return null; }
    },
    write: (source, value) => { if (available) window.localStorage.setItem(`luma:data:${source}`, JSON.stringify(value)); },
  };
}

function defaultFetcher(source) {
  return fetch(source).then(async (response) => {
    if (!response.ok) throw new Error(`Request failed with ${response.status}.`);
    return (response.headers.get("content-type") ?? "").includes("application/json") ? response.json() : response.text();
  });
}

const FONTS = {
  system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  rounded: 'ui-rounded, "Nunito", system-ui, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: 'ui-monospace, "Cascadia Code", "SFMono-Regular", Consolas, monospace',
};
const SEMANTIC_TEXT = {
  title: [26, 720], heading: [44, 760], subtitle: [22, 560], text: [16, 400], paragraph: [16, 400],
  label: [12, 720], caption: [13, 500], quote: [21, 520], code: [14, 500], badge: [12, 760], icon: [28, 500], link: [16, 650],
};
const ICONS = { sparkles: "✦", star: "★", check: "✓", heart: "♥", arrow: "→", plus: "+", menu: "☰", info: "i", warning: "!", user: "●" };
const SURFACE_LAYOUTS = new Set(["card", "hero", "header", "footer", "nav", "aside"]);

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function lerp(from, to, amount) { return from + (to - from) * amount; }

function roundedRect(context, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function edgeValues(style, name, fallback = 0) {
  const all = style[name] ?? fallback;
  const horizontal = style[`${name}_x`] ?? all;
  const vertical = style[`${name}_y`] ?? all;
  return {
    top: style[`${name}_top`] ?? vertical,
    right: style[`${name}_right`] ?? horizontal,
    bottom: style[`${name}_bottom`] ?? vertical,
    left: style[`${name}_left`] ?? horizontal,
  };
}

function inheritedStyle(parent, current) {
  const inheritedKeys = ["accent", "accent_text", "text", "muted", "outline", "spacing", "radius", "font", "font_size", "line_height", "letter_spacing"];
  const result = {};
  for (const key of inheritedKeys) result[key] = current[key] ?? parent[key];
  result.surface = parent.surface;
  return result;
}

function textAppearance(element, style) {
  const [baseSize, semanticWeight] = SEMANTIC_TEXT[element.type] ?? SEMANTIC_TEXT.text;
  const semanticSize = element.role === "hero" ? Math.max(baseSize, 44) : baseSize;
  const scale = (style.font_size ?? 16) / 16;
  const size = element.style?.font_size ?? semanticSize * scale;
  const weight = element.style?.font_weight ?? semanticWeight;
  const familyName = element.type === "code" ? "mono" : (element.style?.font ?? style.font ?? "system");
  const lineHeight = size * (element.style?.line_height ?? style.line_height ?? 1.5);
  return { size, weight, lineHeight, font: `${weight} ${size}px ${FONTS[familyName] ?? FONTS.system}` };
}

function wrappedLines(context, text, width) {
  const result = [];
  for (const paragraph of String(text).split("\n")) {
    if (!paragraph) { result.push(""); continue; }
    const words = paragraph.split(/\s+/);
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (line && context.measureText(next).width > width) { result.push(line); line = word; }
      else line = next;
    }
    result.push(line);
  }
  return result.length ? result : [""];
}

function moveNode(node, dx, dy) {
  node.x += dx; node.y += dy;
  for (const child of node.children ?? []) moveNode(child, dx, dy);
}

function hexColor(value) {
  if (typeof value !== "string") return null;
  const short = value.match(/^#([0-9a-f]{3})$/i);
  const full = value.match(/^#([0-9a-f]{6})$/i);
  const hex = short ? short[1].split("").map((item) => item + item).join("") : full?.[1];
  return hex ? [Number.parseInt(hex.slice(0, 2), 16), Number.parseInt(hex.slice(2, 4), 16), Number.parseInt(hex.slice(4, 6), 16)] : null;
}

function mixColor(from, to, amount) {
  const a = hexColor(from); const b = hexColor(to);
  if (!a || !b) return amount < 0.5 ? from : to;
  return `rgb(${a.map((value, index) => Math.round(lerp(value, b[index], amount))).join(", ")})`;
}

function easing(name, amount) {
  const value = clamp(amount, 0, 1);
  if (name === "linear") return value;
  if (name === "ease_in") return value * value;
  if (name === "ease_out") return 1 - (1 - value) ** 3;
  if (name === "ease_in_out") return value < 0.5 ? 4 * value ** 3 : 1 - ((-2 * value + 2) ** 3) / 2;
  return 1 - (1 - value) ** 2;
}

/** Mount a Luma program as a responsive, canvas-rendered application. */
function mountLumaApp(container, source, { fetcher = defaultFetcher, storage = null, data = null } = {}) {
  if (!(container instanceof HTMLElement)) throw new Error("mountLumaApp() needs a browser element to mount into.");
  const runtime = createAppRuntime(source, { storage: storage ?? browserStorage("luma:remember"), data: data ?? browserData(), fetcher });
  const canvas = document.createElement("canvas");
  canvas.tabIndex = 0;
  canvas.setAttribute("role", "application");
  canvas.setAttribute("aria-label", `${runtime.view().name} Luma application`);
  container.replaceChildren(canvas);
  const context = canvas.getContext("2d");
  const drafts = new Map();
  const imageCache = new Map();
  const hoverAmounts = new Map();
  let zones = [];
  let activeInput = null;
  let hoveredKey = null;
  let pressedKey = null;
  let message = "";
  let frameRequested = false;
  let animationEpoch = performance.now();
  let lastFrame = animationEpoch;
  let currentScreen = runtime.view().screen.name;
  let sequence = 0;
  let needsAnotherFrame = false;
  let destroyed = false;

  function schedule() {
    if (destroyed || frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(renderFrame);
  }

  function putZone(kind, node, element, extra = {}) {
    zones.push({ kind, key: node.key, x: node.x, y: node.y, width: node.width, height: node.height, element, ...extra });
  }

  function layoutCollection(elements, x, y, width, parentStyle, path, mode = "column", layoutStyle = {}) {
    const gap = layoutStyle.gap ?? layoutStyle.spacing ?? parentStyle.spacing ?? 16;
    if (mode === "overlay") {
      const children = elements.map((element, index) => layoutElement(element, x, y, width, parentStyle, `${path}.${index}`));
      return { children, height: Math.max(0, ...children.map((node) => node.totalHeight)) };
    }
    const isGrid = mode === "grid" || mode === "row";
    if (isGrid) {
      const responsive = width < 560 ? 1 : width < 900 ? 2 : 3;
      const columns = Math.max(1, Math.min(elements.length || 1, layoutStyle.columns ?? (mode === "row" ? (width < 560 && layoutStyle.wrap !== false ? 1 : elements.length || 1) : responsive)));
      const cellWidth = (width - gap * (columns - 1)) / columns;
      const children = [];
      let rowY = y;
      for (let start = 0; start < elements.length; start += columns) {
        const row = elements.slice(start, start + columns).map((element, offset) => layoutElement(element, x + offset * (cellWidth + gap), rowY, cellWidth, parentStyle, `${path}.${start + offset}`));
        const rowHeight = Math.max(0, ...row.map((node) => node.totalHeight));
        children.push(...row);
        rowY += rowHeight + (start + columns < elements.length ? gap : 0);
      }
      return { children, height: rowY - y };
    }
    const children = [];
    let cursor = y;
    for (let index = 0; index < elements.length; index += 1) {
      const child = layoutElement(elements[index], x, cursor, width, parentStyle, `${path}.${index}`);
      const spare = width - child.totalWidth;
      if (spare > 0 && layoutStyle.align && layoutStyle.align !== "stretch") {
        const offset = layoutStyle.align === "center" ? spare / 2 : layoutStyle.align === "end" ? spare : 0;
        moveNode(child, offset, 0);
      }
      children.push(child);
      cursor += child.totalHeight + (index < elements.length - 1 ? gap : 0);
    }
    return { children, height: cursor - y };
  }

  function layoutElement(element, x, y, availableWidth, parentStyle, key) {
    const own = element.style ?? {};
    const style = { ...parentStyle, ...own };
    const margin = edgeValues(own, "margin");
    let width = own.width ?? Math.max(1, availableWidth - margin.left - margin.right);
    if (own.min_width !== undefined) width = Math.max(width, own.min_width);
    if (own.max_width !== undefined) width = Math.min(width, own.max_width);
    width = Math.min(width, Math.max(1, availableWidth - margin.left - margin.right));
    const node = { element, style, own, key, sequence: sequence++, x: x + margin.left, y: y + margin.top, width, height: 0, totalWidth: width + margin.left + margin.right, totalHeight: 0, children: [] };

    if (element.type === "layout") {
      const defaultPadding = SURFACE_LAYOUTS.has(element.layout) ? (style.spacing ?? 16) : 0;
      const padding = edgeValues(own, "padding", defaultPadding);
      const contentWidth = Math.max(1, width - padding.left - padding.right);
      const mode = element.layout === "grid" ? "grid" : element.layout === "row" ? "row" : element.layout === "overlay" ? "overlay" : "column";
      const childStyle = inheritedStyle(parentStyle, style);
      const laidOut = layoutCollection(element.children, node.x + padding.left, node.y + padding.top, contentWidth, childStyle, key, mode, style);
      node.children = laidOut.children;
      node.paintSurface = SURFACE_LAYOUTS.has(element.layout) || own.surface !== undefined || own.surface_end !== undefined || own.outline !== undefined || own.shadow !== undefined;
      node.height = padding.top + laidOut.height + padding.bottom;
    } else if (["title", "heading", "subtitle", "text", "paragraph", "label", "caption", "quote", "code", "badge", "icon", "link"].includes(element.type)) {
      const defaultPadX = element.type === "badge" ? 12 : element.type === "code" ? 14 : element.type === "quote" ? 18 : 0;
      const defaultPadY = element.type === "badge" ? 7 : element.type === "code" ? 12 : element.type === "quote" ? 10 : 0;
      const padding = edgeValues(own, "padding");
      if (own.padding === undefined && own.padding_x === undefined) { padding.left = defaultPadX; padding.right = defaultPadX; }
      if (own.padding === undefined && own.padding_y === undefined) { padding.top = defaultPadY; padding.bottom = defaultPadY; }
      const appearance = textAppearance(element, style);
      context.font = appearance.font;
      node.text = element.type === "icon" ? (ICONS[element.content] ?? element.content) : element.type === "quote" ? `“${element.content}”` : element.content;
      node.lines = wrappedLines(context, node.text, Math.max(1, width - padding.left - padding.right));
      node.appearance = appearance;
      node.padding = padding;
      node.height = padding.top + node.lines.length * appearance.lineHeight + padding.bottom;
    } else if (element.type === "image") {
      node.height = own.height ?? width / (own.aspect_ratio ?? 16 / 9);
    } else if (element.type === "progress") {
      node.height = own.height ?? 18;
    } else if (element.type === "divider") {
      node.height = Math.max(1, own.outline_width ?? 1);
    } else if (element.type === "spacer") {
      node.height = element.size;
    } else if (element.type === "input") {
      const fieldHeight = element.inputType === "textarea" ? 112 : 52;
      node.labelHeight = 22;
      node.height = node.labelHeight + (own.height ?? fieldHeight);
    } else if (element.type === "slider") {
      node.labelHeight = 22; node.height = node.labelHeight + (own.height ?? 50);
    } else if (element.type === "toggle") {
      node.height = own.height ?? 42;
    } else if (element.type === "choice") {
      node.height = element.presentation === "tabs" || element.presentation === "select" ? 46 : element.options.length * 42 + Math.max(0, element.options.length - 1) * 8;
    } else if (element.type === "button") {
      const padding = edgeValues(own, "padding");
      const vertical = own.padding === undefined && own.padding_y === undefined ? 14 : padding.top;
      node.height = own.height ?? Math.max(48, (own.font_size ?? 15) * (own.line_height ?? 1.3) + vertical * 2);
    }
    if (own.height !== undefined && !["image", "input", "button"].includes(element.type)) node.height = own.height;
    if (own.min_height !== undefined) node.height = Math.max(node.height, own.min_height);
    if (own.max_height !== undefined) node.height = Math.min(node.height, own.max_height);
    node.totalHeight = margin.top + node.height + margin.bottom;
    return node;
  }

  function shadowFor(name, accent) {
    if (name === "small") return [0, 3, 8, "rgba(15, 23, 42, 0.14)"];
    if (name === "medium") return [0, 8, 22, "rgba(15, 23, 42, 0.18)"];
    if (name === "large") return [0, 18, 48, "rgba(15, 23, 42, 0.22)"];
    if (name === "glow") return [0, 0, 24, accent];
    return [0, 0, 0, "transparent"];
  }

  function stateStyle(node, now) {
    const style = { ...node.style };
    const target = hoveredKey === node.key ? 1 : 0;
    const previous = hoverAmounts.get(node.key) ?? 0;
    const transition = node.own.transition ?? 0;
    const step = transition <= 0 ? 1 : Math.min(1, (now - lastFrame) / transition);
    const hover = previous + (target - previous) * step;
    hoverAmounts.set(node.key, hover);
    if (Math.abs(target - hover) > 0.01) needsAnotherFrame = true;
    for (const key of ["accent", "surface", "text", "outline"]) {
      const hoverValue = node.own[`hover_${key}`];
      if (hoverValue !== undefined) style[key] = mixColor(style[key], hoverValue, hover);
    }
    style.visualScale = (node.own.scale ?? 1) * lerp(1, node.own.hover_scale ?? 1, hover) * (pressedKey === node.key ? node.own.press_scale ?? 0.98 : 1);
    style.visualLift = lerp(0, node.own.hover_lift ?? 0, hover);
    if (activeInput?.key === node.key && node.own.focus_outline) style.outline = node.own.focus_outline;
    return style;
  }

  function motionFor(node, now, theme) {
    const animation = node.element.animation;
    if (!animation || theme.motion === 0) return { alpha: 1, x: 0, y: 0, scale: 1, rotation: 0 };
    const duration = Math.max(1, animation.duration * theme.motion);
    const delay = (animation.delay + node.sequence * animation.stagger) * theme.motion;
    const elapsed = now - animationEpoch - delay;
    if (elapsed < 0) { needsAnotherFrame = true; return { alpha: 0, x: 0, y: 14, scale: 1, rotation: 0 }; }
    const forever = animation.repeat === "forever";
    const repeats = forever ? Infinity : animation.repeat;
    const done = elapsed >= duration * repeats;
    if (!done || forever) needsAnotherFrame = true;
    const raw = done ? 1 : (elapsed % duration) / duration;
    const amount = easing(animation.easing, raw);
    const start = 1 - amount;
    const result = { alpha: 1, x: 0, y: 0, scale: 1, rotation: 0 };
    if (animation.effect === "fade") result.alpha = amount;
    if (animation.effect === "fade_up") { result.alpha = amount; result.y = 22 * start; }
    if (animation.effect === "fade_down") { result.alpha = amount; result.y = -22 * start; }
    if (animation.effect === "slide_left") { result.alpha = amount; result.x = 50 * start; }
    if (animation.effect === "slide_right") { result.alpha = amount; result.x = -50 * start; }
    if (animation.effect === "scale") { result.alpha = amount; result.scale = 0.86 + 0.14 * amount; }
    if (animation.effect === "pop") { result.alpha = amount; result.scale = 0.75 + 0.35 * amount - 0.1 * amount * amount; }
    if (animation.effect === "pulse") result.scale = 1 + Math.sin(raw * Math.PI * 2) * 0.04;
    if (animation.effect === "spin") result.rotation = raw * Math.PI * 2;
    return result;
  }

  function fillBox(node, style, fallback, now) {
    const fill = style.surface ?? fallback;
    const radius = style.radius ?? 0;
    const [shadowX, shadowY, shadowBlur, shadowColor] = shadowFor(style.shadow, style.accent);
    context.save();
    context.shadowOffsetX = shadowX; context.shadowOffsetY = shadowY; context.shadowBlur = shadowBlur; context.shadowColor = shadowColor;
    roundedRect(context, node.x, node.y, node.width, node.height, radius);
    if (style.surface_end && style.gradient && style.gradient !== "none") {
      const horizontal = style.gradient === "horizontal";
      const diagonal = style.gradient === "diagonal";
      const gradient = context.createLinearGradient(node.x, node.y, node.x + (horizontal || diagonal ? node.width : 0), node.y + (!horizontal ? node.height : 0));
      gradient.addColorStop(0, fill); gradient.addColorStop(1, style.surface_end); context.fillStyle = gradient;
    } else context.fillStyle = fill;
    context.fill(); context.restore();
    if (style.outline && (style.outline_width ?? 1) > 0) {
      roundedRect(context, node.x, node.y, node.width, node.height, radius);
      context.strokeStyle = style.outline; context.lineWidth = style.outline_width ?? 1; context.stroke();
    }
  }

  function drawTextNode(node, style) {
    const { element, appearance, padding } = node;
    context.font = appearance.font;
    context.fillStyle = element.role === "muted" || element.type === "caption" || element.type === "label" ? style.muted : style.text;
    context.textBaseline = "alphabetic";
    context.textAlign = style.text_align ?? "left";
    let textX = node.x + padding.left;
    if (context.textAlign === "center") textX = node.x + node.width / 2;
    if (context.textAlign === "right") textX = node.x + node.width - padding.right;
    if (!["badge", "code", "quote"].includes(element.type) && (node.own.surface !== undefined || node.own.surface_end !== undefined || node.own.outline !== undefined || node.own.shadow !== undefined)) {
      fillBox(node, style, style.surface);
      context.fillStyle = element.role === "muted" || element.type === "caption" || element.type === "label" ? style.muted : style.text;
    }
    if (element.type === "badge") {
      fillBox(node, { ...style, surface: style.accent, outline: style.accent, shadow: "none" }, style.accent);
      context.fillStyle = style.accent_text;
    } else if (element.type === "code") {
      fillBox(node, { ...style, surface: node.own.surface ?? "#0f172a", text: node.own.text ?? "#e2e8f0", shadow: node.own.shadow ?? "small" }, "#0f172a");
      context.fillStyle = node.own.text ?? "#e2e8f0";
    } else if (element.type === "link") context.fillStyle = style.accent;
    else if (element.type === "quote") {
      context.fillStyle = style.accent; context.fillRect(node.x, node.y, 4, node.height);
      context.fillStyle = style.text;
    }
    for (let index = 0; index < node.lines.length; index += 1) context.fillText(node.lines[index], textX, node.y + padding.top + appearance.size + index * appearance.lineHeight);
    if (element.type === "link") {
      context.strokeStyle = style.accent; context.lineWidth = 1;
      const underlineY = node.y + padding.top + appearance.size + 3;
      context.beginPath(); context.moveTo(textX, underlineY); context.lineTo(textX + context.measureText(node.lines[0]).width, underlineY); context.stroke();
      putZone("link", node, element);
    }
  }

  function drawNode(node, now, theme) {
    const style = stateStyle(node, now);
    const motion = motionFor(node, now, theme);
    const centerX = node.x + node.width / 2; const centerY = node.y + node.height / 2;
    context.save();
    context.globalAlpha *= (style.opacity ?? 1) * motion.alpha;
    context.translate(centerX + motion.x, centerY + motion.y - style.visualLift);
    context.rotate((style.rotation ?? 0) * Math.PI / 180 + motion.rotation);
    context.scale(style.visualScale * motion.scale, style.visualScale * motion.scale);
    context.translate(-centerX, -centerY);
    if (style.overflow === "clip") { roundedRect(context, node.x, node.y, node.width, node.height, style.radius ?? 0); context.clip(); }

    const element = node.element;
    if (element.type === "layout") {
      if (node.paintSurface) fillBox(node, style, style.surface, now);
      for (const child of node.children) drawNode(child, now, theme);
    } else if (["title", "heading", "subtitle", "text", "paragraph", "label", "caption", "quote", "code", "badge", "icon", "link"].includes(element.type)) drawTextNode(node, style);
    else if (element.type === "divider") {
      context.strokeStyle = style.outline; context.lineWidth = node.height;
      context.beginPath(); context.moveTo(node.x, node.y + node.height / 2); context.lineTo(node.x + node.width, node.y + node.height / 2); context.stroke();
    } else if (element.type === "image") {
      fillBox(node, { ...style, surface: node.own.surface ?? "#e2e8f0", shadow: node.own.shadow ?? "none" }, "#e2e8f0");
      let image = imageCache.get(element.source);
      if (!image) {
        image = new Image(); imageCache.set(element.source, image);
        image.onload = schedule; image.onerror = schedule; image.src = element.source;
      }
      if (image.complete && image.naturalWidth) {
        context.save(); roundedRect(context, node.x, node.y, node.width, node.height, style.radius ?? 0); context.clip();
        const ratio = Math.max(node.width / image.naturalWidth, node.height / image.naturalHeight);
        const width = image.naturalWidth * ratio; const height = image.naturalHeight * ratio;
        context.drawImage(image, node.x + (node.width - width) / 2, node.y + (node.height - height) / 2, width, height); context.restore();
      } else {
        context.font = `500 14px ${FONTS.system}`; context.fillStyle = style.muted; context.textAlign = "center";
        context.fillText(element.alt, node.x + node.width / 2, node.y + node.height / 2); context.textAlign = "left";
      }
    } else if (element.type === "progress") {
      fillBox(node, { ...style, surface: node.own.surface ?? style.outline, outline_width: 0, shadow: "none" }, style.outline);
      const amount = clamp((element.value - element.min) / (element.max - element.min), 0, 1);
      const progressNode = { ...node, width: node.width * amount };
      fillBox(progressNode, { ...style, surface: style.accent, surface_end: node.own.surface_end, outline_width: 0, shadow: "none" }, style.accent);
    } else if (element.type === "input" || element.type === "slider") {
      context.font = `700 12px ${FONTS[style.font] ?? FONTS.system}`; context.fillStyle = style.muted;
      context.fillText(element.label, node.x, node.y + 13);
      const field = { ...node, y: node.y + node.labelHeight, height: node.height - node.labelHeight };
      fillBox(field, { ...style, surface: node.own.surface ?? style.surface, outline: activeInput?.key === node.key ? (node.own.focus_outline ?? style.accent) : style.outline, shadow: node.own.shadow ?? "none" }, style.surface);
      if (element.type === "slider") {
        const ratio = (element.current - element.min) / (element.max - element.min);
        const trackY = field.y + field.height / 2;
        context.lineCap = "round"; context.lineWidth = 6; context.strokeStyle = style.outline;
        context.beginPath(); context.moveTo(field.x + 18, trackY); context.lineTo(field.x + field.width - 18, trackY); context.stroke();
        context.strokeStyle = style.accent; context.beginPath(); context.moveTo(field.x + 18, trackY); context.lineTo(field.x + 18 + (field.width - 36) * ratio, trackY); context.stroke();
        context.fillStyle = style.accent; context.beginPath(); context.arc(field.x + 18 + (field.width - 36) * ratio, trackY, 9, 0, Math.PI * 2); context.fill();
        putZone("slider", node, element);
      } else {
        let value = activeInput?.key === node.key ? drafts.get(node.key) : String(element.current);
        if (element.inputType === "password") value = "•".repeat(value.length);
        context.font = `500 16px ${FONTS[style.font] ?? FONTS.system}`; context.fillStyle = style.text;
        context.fillText(value || (element.inputType === "date" ? "YYYY-MM-DD" : ""), field.x + 15, field.y + 32);
        if (element.inputType === "color" && /^#[0-9a-f]{6}$/i.test(value)) { context.fillStyle = value; roundedRect(context, field.x + field.width - 42, field.y + 10, 28, 28, 8); context.fill(); }
        putZone("input", node, element);
      }
    } else if (element.type === "toggle") {
      context.font = `500 16px ${FONTS[style.font] ?? FONTS.system}`; context.fillStyle = style.text; context.fillText(element.label, node.x, node.y + 27);
      const switchX = node.x + node.width - 54; roundedRect(context, switchX, node.y + 3, 54, 34, 17);
      context.fillStyle = element.current ? style.accent : style.outline; context.fill();
      context.fillStyle = style.accent_text; context.beginPath(); context.arc(switchX + (element.current ? 37 : 17), node.y + 20, 12, 0, Math.PI * 2); context.fill();
      putZone("toggle", node, element);
    } else if (element.type === "choice") {
      context.font = `600 14px ${FONTS[style.font] ?? FONTS.system}`;
      if (element.presentation === "select") {
        fillBox(node, { ...style, surface: node.own.surface ?? style.surface, shadow: node.own.shadow ?? "none" }, style.surface);
        context.fillStyle = style.text; context.fillText(element.current, node.x + 15, node.y + 29); context.fillText("⌄", node.x + node.width - 28, node.y + 28);
        putZone("select", node, element);
      } else {
        const horizontal = element.presentation === "tabs";
        const gap = 8; const optionWidth = horizontal ? (node.width - gap * (element.options.length - 1)) / element.options.length : node.width;
        element.options.forEach((option, index) => {
          const optionNode = { ...node, x: horizontal ? node.x + index * (optionWidth + gap) : node.x, y: horizontal ? node.y : node.y + index * 50, width: optionWidth, height: 42 };
          const selected = option === element.current;
          fillBox(optionNode, { ...style, surface: selected ? style.accent : style.surface, outline: selected ? style.accent : style.outline, shadow: "none" }, selected ? style.accent : style.surface);
          context.fillStyle = selected ? style.accent_text : style.text;
          if (element.presentation === "radio") { context.beginPath(); context.arc(optionNode.x + 17, optionNode.y + 21, 7, 0, Math.PI * 2); selected ? context.fill() : context.stroke(); }
          context.fillText(option, optionNode.x + (element.presentation === "radio" ? 34 : 14), optionNode.y + 26);
          zones.push({ kind: "choice", key: `${node.key}.${index}`, x: optionNode.x, y: optionNode.y, width: optionNode.width, height: optionNode.height, element, option });
        });
      }
    } else if (element.type === "button") {
      const secondary = element.role === "secondary" || ["secondary", "quiet"].includes(node.own.intent);
      fillBox(node, { ...style, surface: secondary ? style.surface : style.accent, outline: secondary ? style.outline : style.accent }, secondary ? style.surface : style.accent);
      context.font = `${node.own.font_weight ?? 700} ${node.own.font_size ?? 15}px ${FONTS[style.font] ?? FONTS.system}`;
      context.fillStyle = secondary ? style.text : style.accent_text; context.textAlign = "center"; context.textBaseline = "middle";
      context.fillText(element.label, node.x + node.width / 2, node.y + node.height / 2); context.textAlign = "left"; context.textBaseline = "alphabetic";
      putZone("button", node, element);
    }
    context.restore();
  }

  function renderFrame(now) {
    if (destroyed) return;
    frameRequested = false; needsAnotherFrame = false; sequence = 0;
    const view = runtime.view();
    if (view.screen.name !== currentScreen) { currentScreen = view.screen.name; animationEpoch = now; hoverAmounts.clear(); }
    const theme = view.theme;
    const available = Math.max(240, Math.floor(container.clientWidth || window.innerWidth || theme.width));
    const canvasWidth = available;
    if (canvas.width !== canvasWidth) canvas.width = canvasWidth;
    const outer = clamp(theme.spacing * 1.5, 12, 40);
    const contentWidth = Math.min(theme.max_width, theme.width, canvasWidth - outer * 2);
    const contentX = Math.max(outer, (canvasWidth - contentWidth) / 2);
    context.font = `400 ${theme.font_size}px ${FONTS[theme.font] ?? FONTS.system}`;
    const laidOut = layoutCollection(view.screen.elements, contentX, outer, contentWidth, theme, "screen", "column", { gap: theme.spacing });
    const messageHeight = message ? 42 : 0;
    const wantedHeight = Math.max(240, Math.ceil(outer + laidOut.height + outer + messageHeight));
    if (canvas.height !== wantedHeight) canvas.height = wantedHeight;
    context.fillStyle = theme.canvas; context.fillRect(0, 0, canvas.width, canvas.height);
    zones = [];
    for (const node of laidOut.children) drawNode(node, now, theme);
    if (message) { context.font = `600 13px ${FONTS[theme.font] ?? FONTS.system}`; context.fillStyle = theme.muted; context.fillText(message, contentX, canvas.height - outer); }
    lastFrame = now;
    if (needsAnotherFrame) schedule();
  }

  function pointFor(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
  }
  function zoneAt(point) { return [...zones].reverse().find((zone) => point.x >= zone.x && point.x <= zone.x + zone.width && point.y >= zone.y && point.y <= zone.y + zone.height); }

  function commitInput() {
    if (!activeInput) return true;
    try {
      const value = drafts.get(activeInput.key) ?? "";
      if (activeInput.element.id) runtime.enterId(activeInput.element.id, value); else runtime.enter(activeInput.element.state, value);
      activeInput = null; message = ""; return true;
    } catch (error) { message = `Luma: ${error.message}`; return false; }
  }

  async function activate(zone, point) {
    if (!zone) { commitInput(); schedule(); return; }
    try {
      if (zone.kind !== "input" && !commitInput()) { schedule(); return; }
      const element = zone.element;
      if (zone.kind === "input") {
        activeInput = zone; drafts.set(zone.key, String(element.current)); canvas.focus();
      } else if (zone.kind === "slider") {
        const ratio = clamp((point.x - zone.x - 18) / (zone.width - 36), 0, 1);
        const step = element.step ?? 1; const raw = element.min + (element.max - element.min) * ratio;
        const value = element.min + Math.round((raw - element.min) / step) * step;
        element.id ? runtime.enterId(element.id, value) : runtime.enter(element.state, value);
      } else if (zone.kind === "choice") element.id ? runtime.chooseId(element.id, zone.option) : runtime.choose(element.state, zone.option);
      else if (zone.kind === "select") {
        const next = element.options[(element.options.indexOf(element.current) + 1) % element.options.length];
        element.id ? runtime.chooseId(element.id, next) : runtime.choose(element.state, next);
      } else if (zone.kind === "toggle") element.id ? runtime.toggleId(element.id) : runtime.toggle(element.state);
      else if (zone.kind === "button") element.id ? await runtime.pressIdAsync(element.id) : await runtime.pressAsync(element.label);
      else if (zone.kind === "link") window.open(element.target, "_blank", "noopener,noreferrer");
      message = ""; animationEpoch = performance.now();
    } catch (error) { message = `Luma: ${error.message}`; }
    schedule();
  }

  canvas.addEventListener("pointermove", (event) => { const zone = zoneAt(pointFor(event)); const key = zone?.key ?? null; if (key !== hoveredKey) { hoveredKey = key; schedule(); } });
  canvas.addEventListener("pointerleave", () => { hoveredKey = null; pressedKey = null; schedule(); });
  canvas.addEventListener("pointerdown", (event) => { pressedKey = zoneAt(pointFor(event))?.key ?? null; schedule(); });
  canvas.addEventListener("pointerup", async (event) => { const point = pointFor(event); const zone = zoneAt(point); pressedKey = null; await activate(zone, point); });
  canvas.addEventListener("keydown", (event) => {
    if (!activeInput) return;
    if (event.key === "Enter" && activeInput.element.inputType !== "textarea") { commitInput(); schedule(); event.preventDefault(); return; }
    if (event.key === "Backspace") { drafts.set(activeInput.key, (drafts.get(activeInput.key) ?? "").slice(0, -1)); schedule(); event.preventDefault(); return; }
    if (event.key.length === 1 || (event.key === "Enter" && activeInput.element.inputType === "textarea")) {
      drafts.set(activeInput.key, (drafts.get(activeInput.key) ?? "") + (event.key === "Enter" ? "\n" : event.key)); schedule(); event.preventDefault();
    }
  });
  const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(schedule) : null;
  const handleResize = () => schedule();
  resizeObserver?.observe(container);
  window.addEventListener("resize", handleResize);
  runtime.destroy = () => {
    if (destroyed) return;
    destroyed = true;
    resizeObserver?.disconnect();
    window.removeEventListener("resize", handleResize);
    canvas.remove();
  };
  schedule();
  return runtime;
}

globalThis.LumaRuntime = Object.freeze({ LumaError, parse, buildApp, createAppRuntime, previewApp, mountLumaApp });

const LUMA_PLUGIN_VERSION = "1.0.0";
const LUMA_LANGUAGE_VERSION = "0.6";
const LUMA_POLL_INTERVAL = 160;
const LUMA_RENDER_DELAY = 320;

class LumaSupportPlugin {
  constructor(IDE) {
    this.IDE = IDE;
    this.pollTimer = null;
    this.renderTimer = null;
    this.runtime = null;
    this.lastPath = null;
    this.lastSource = null;
    this.rememberedValues = new Map();
    this.dataValues = new Map();
    this.nodes = {};
  }

  activate() {
    if (!this.IDE || Number(this.IDE.version) < 3) {
      throw new Error("Luma Environment needs All-In Studio extension API v3 or newer.");
    }

    if (this.IDE.getSurface() === "status") {
      this.IDE.registerPanel({
        id: "luma-preview",
        title: "Luma Live Preview",
        icon: "✦",
        description: "Run the active .luma file in the native Luma canvas renderer.",
      });
      this.IDE.addStatusBarItem(`<span title="Luma ${LUMA_LANGUAGE_VERSION} support"><i>✦</i> Luma ${LUMA_LANGUAGE_VERSION}</span>`);
      this.IDE.log(`Luma Environment ${LUMA_PLUGIN_VERSION} activated.`);
      return;
    }

    if (this.IDE.getSurface() === "panel") this.activatePanel();
  }

  deactivate() {
    clearInterval(this.pollTimer);
    clearTimeout(this.renderTimer);
    this.destroyRuntime();
  }

  activatePanel() {
    const root = this.IDE.getPanelRoot();
    if (!root) throw new Error("The Luma preview could not find its panel root.");

    root.innerHTML = `
      <style>
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        html, body, #plugin-root { width: 100%; height: 100%; min-height: 0; overflow: hidden; }
        .luma-plugin-shell { width: 100%; height: 100%; min-height: 420px; display: grid; grid-template-rows: auto minmax(0, 1fr); background: #0b111c; color: #dce7fb; }
        .luma-plugin-bar { min-width: 0; display: flex; align-items: center; gap: 10px; min-height: 52px; padding: 9px 12px; border-bottom: 1px solid rgba(165, 184, 221, .16); background: linear-gradient(180deg, #152137, #101a2b); }
        .luma-plugin-mark { display: grid; place-items: center; width: 30px; height: 30px; flex: 0 0 30px; border: 1px solid rgba(160, 174, 255, .35); border-radius: 9px; background: rgba(109, 124, 255, .14); color: #aebaff; font-size: 17px; }
        .luma-plugin-meta { min-width: 0; flex: 1; }
        .luma-plugin-name { font-size: 12px; font-weight: 750; letter-spacing: .01em; color: #f2f6ff; }
        .luma-plugin-file { margin-top: 2px; overflow: hidden; color: #8fa1bf; font: 10px/1.3 ui-monospace, "Cascadia Code", Consolas, monospace; text-overflow: ellipsis; white-space: nowrap; }
        .luma-plugin-state { display: inline-flex; align-items: center; gap: 6px; flex: 0 0 auto; color: #9fb0cc; font-size: 10px; }
        .luma-plugin-dot { width: 7px; height: 7px; border-radius: 999px; background: #64748b; box-shadow: 0 0 0 3px rgba(100, 116, 139, .12); }
        .luma-plugin-state[data-kind="live"] .luma-plugin-dot { background: #57d6a2; box-shadow: 0 0 0 3px rgba(87, 214, 162, .13); }
        .luma-plugin-state[data-kind="waiting"] .luma-plugin-dot { background: #f0bd65; box-shadow: 0 0 0 3px rgba(240, 189, 101, .13); }
        .luma-plugin-state[data-kind="error"] .luma-plugin-dot { background: #ff7184; box-shadow: 0 0 0 3px rgba(255, 113, 132, .13); }
        .luma-plugin-refresh { display: inline-grid; place-items: center; width: 30px; height: 30px; flex: 0 0 30px; border: 1px solid rgba(165, 184, 221, .2); border-radius: 8px; background: rgba(255, 255, 255, .035); color: #cdd8ed; cursor: pointer; font: 16px system-ui, sans-serif; }
        .luma-plugin-refresh:hover { border-color: rgba(174, 186, 255, .48); background: rgba(109, 124, 255, .12); color: #fff; }
        .luma-plugin-stage { min-width: 0; min-height: 0; overflow: auto; background: #080d15; }
        .luma-plugin-message { min-height: 100%; display: grid; place-items: center; padding: 32px 22px; text-align: center; }
        .luma-plugin-message-card { width: min(430px, 100%); padding: 24px; border: 1px solid rgba(165, 184, 221, .16); border-radius: 16px; background: #111b2b; box-shadow: 0 18px 48px rgba(0, 0, 0, .22); }
        .luma-plugin-message-icon { margin-bottom: 12px; color: #aebaff; font-size: 28px; }
        .luma-plugin-message h2 { margin: 0 0 8px; color: #f1f5ff; font: 700 15px/1.35 system-ui, sans-serif; }
        .luma-plugin-message p { margin: 0; color: #91a2bd; font: 12px/1.65 system-ui, sans-serif; white-space: pre-wrap; }
        .luma-plugin-message[data-kind="error"] .luma-plugin-message-card { border-color: rgba(255, 113, 132, .28); }
        .luma-plugin-message[data-kind="error"] .luma-plugin-message-icon { color: #ff8797; }
        .luma-plugin-message[data-kind="error"] p { color: #ffc1c9; font-family: ui-monospace, "Cascadia Code", Consolas, monospace; text-align: left; }
      </style>
      <section class="luma-plugin-shell" aria-label="Luma live preview">
        <header class="luma-plugin-bar">
          <span class="luma-plugin-mark" aria-hidden="true">✦</span>
          <span class="luma-plugin-meta">
            <span class="luma-plugin-name">Luma Live Preview</span>
            <span class="luma-plugin-file">No Luma file selected</span>
          </span>
          <span class="luma-plugin-state" data-kind="idle"><span class="luma-plugin-dot"></span><span class="luma-plugin-state-text">Idle</span></span>
          <button class="luma-plugin-refresh" type="button" title="Render again" aria-label="Render Luma again">↻</button>
        </header>
        <main class="luma-plugin-stage"></main>
      </section>`;

    this.nodes.file = root.querySelector(".luma-plugin-file");
    this.nodes.state = root.querySelector(".luma-plugin-state");
    this.nodes.stateText = root.querySelector(".luma-plugin-state-text");
    this.nodes.stage = root.querySelector(".luma-plugin-stage");
    root.querySelector(".luma-plugin-refresh").addEventListener("click", () => this.checkEditor(true));

    this.showMessage("✦", "Open a Luma file", "The active .luma file will run here as you type.");
    this.checkEditor(true);
    this.pollTimer = setInterval(() => this.checkEditor(false), LUMA_POLL_INTERVAL);
  }

  checkEditor(force) {
    const path = String(this.IDE.getActiveFilePath() || "");
    const source = String(this.IDE.getActiveEditorValue() || "");
    if (!force && path === this.lastPath && source === this.lastSource) return;

    this.lastPath = path;
    this.lastSource = source;
    this.nodes.file.textContent = path || "No file selected";
    clearTimeout(this.renderTimer);

    if (!/\.luma$/i.test(path)) {
      this.destroyRuntime();
      this.setStatus("Waiting", "idle");
      this.showMessage("✦", "Open a Luma file", "Choose a file ending in .luma to start the live preview.");
      return;
    }

    this.setStatus("Checking…", "waiting");
    this.renderTimer = setTimeout(() => this.render(path, source), force ? 0 : LUMA_RENDER_DELAY);
  }

  render(path, source) {
    if (path !== this.lastPath || source !== this.lastSource) return;
    this.destroyRuntime();
    this.nodes.stage.replaceChildren();

    try {
      this.runtime = globalThis.LumaRuntime.mountLumaApp(this.nodes.stage, source, {
        storage: this.memoryStorage(),
        data: this.memoryData(),
        fetcher: (url) => this.fetchForLuma(url),
      });
      this.setStatus("Live", "live");
    } catch (error) {
      this.setStatus("Error", "error");
      this.showMessage("!", "Luma could not render this file", error?.message || String(error), "error");
    }
  }

  destroyRuntime() {
    if (!this.runtime) return;
    try { this.runtime.destroy?.(); } catch (error) { this.IDE.log(`Luma cleanup: ${error.message}`); }
    this.runtime = null;
  }

  memoryStorage() {
    return {
      read: (key) => this.rememberedValues.has(key) ? this.rememberedValues.get(key) : null,
      write: (key, value) => this.rememberedValues.set(key, value),
    };
  }

  memoryData() {
    return {
      read: (key) => this.dataValues.has(key) ? this.dataValues.get(key) : null,
      write: (key, value) => this.dataValues.set(key, value),
    };
  }

  async fetchForLuma(url) {
    try {
      const response = await this.IDE.request({ url, method: "GET" });
      if (Number(response.status) < 200 || Number(response.status) >= 300) {
        throw new Error(`Request failed with ${response.status} ${response.statusText || ""}`.trim());
      }
      const headers = response.headers && typeof response.headers === "object" ? response.headers : {};
      const contentType = Object.entries(headers).find(([name]) => name.toLowerCase() === "content-type")?.[1] || "";
      return String(contentType).includes("application/json") ? JSON.parse(response.body) : response.body;
    } catch (error) {
      throw new Error(`Luma API request failed: ${error.message}. Add that API domain to this extension's networkDomains permission.`);
    }
  }

  setStatus(label, kind) {
    this.nodes.state.dataset.kind = kind;
    this.nodes.stateText.textContent = label;
  }

  showMessage(icon, title, detail, kind = "empty") {
    const wrapper = document.createElement("section");
    wrapper.className = "luma-plugin-message";
    wrapper.dataset.kind = kind;
    const card = document.createElement("div");
    card.className = "luma-plugin-message-card";
    const symbol = document.createElement("div");
    symbol.className = "luma-plugin-message-icon";
    symbol.textContent = icon;
    const heading = document.createElement("h2");
    heading.textContent = title;
    const copy = document.createElement("p");
    copy.textContent = detail;
    card.append(symbol, heading, copy);
    wrapper.append(card);
    this.nodes.stage.replaceChildren(wrapper);
  }
}

return new LumaSupportPlugin(IDE);
