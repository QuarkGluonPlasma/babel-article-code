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
    },
    ExpressionStatement(node, scope) {
        return evaluate(node.expression);
    },
    AssignmentExpression(node) {
        let curNode = node;
        const targetArr = [curNode.left];
        while(curNode.right.type === 'AssignmentExpression') {
            curNode = curNode.right;
            targetArr.push(curNode.left);
        }
        const value = evaluate(curNode.right);

        targetArr.forEach(target => {
            if (target.type === 'Identifier'){
                const varName = evaluate(target);
                scope.set(varName, value);
            } else if (target.type === 'MemberExpression') {
                const objName = evaluate(target.object);
                const obj = scope.get(objName);
        
                const propName = evaluate(target.property);
                obj[propName] = value;
            }  
        })
    } 
}

function evaluate(node) {
    try {
        return astInterpreters[node.type](node);
    } catch(e) {
        console.error('不支持的节点类型：' + node.type, e);
    }
}

const code = `
let a = { n: 1};
let preA = a;
a.x = a = { n: 2};

`
eval(code);

console.log(scope);
