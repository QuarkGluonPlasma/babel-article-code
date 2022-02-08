// 第一步，实现 scope 和对象定义

const parser = require('@babel/parser');

function eval() {
    const ast = parser.parse(code);
    evaluate(ast.program);
}


const scope = new Map();

const astInterpreters = {
    Program(node) {
        node.body.forEach(item => {
            evaluate(item);
        })
    },
    VariableDeclaration(node) {
        node.declarations.forEach((item) => {
            evaluate(item);
        });
    },
    VariableDeclarator(node) {
        const declareName = evaluate(node.id);
        if (scope.get(declareName)) {
            throw Error('duplicate declare variable：' + declareName);
        } else {
            const valueNode = node.init;
            let value;
            if (valueNode.type === 'Identifier') {
                value = scope.get(valueNode.name);
            } else {
                value = evaluate(valueNode);
            }
            scope.set(declareName, value);
        }
    },
    ObjectExpression(node) {
        const obj = {};
        node.properties.forEach(prop => {
            const key = evaluate(prop.key);
            const value = evaluate(prop.value);
            obj[key] = value;
        });
        return obj;
    },
    Identifier(node) {
        return node.name;
    },
    NumericLiteral(node) {
        return node.value;
    }
}

function evaluate(node) {
    try {
        return astInterpreters[node.type](node);
    } catch(e) {
        console.error('不支持的节点类型：', e);
    }
}

const code = `
let a = { dong: 111};
let b = { guang: 222};
let c = b;
`
eval(code);

console.log(scope);
