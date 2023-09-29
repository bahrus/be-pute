import { tryParse } from 'be-enhanced/cpu.js';
import { lispToCamel } from 'trans-render/lib/lispToCamel.js';
const reValueStatement = [
    {
        regExp: new RegExp(String.raw `^from(?<dependencies>.*)`),
        defaultVals: {}
    }
];
export function prsValue(self) {
    //be careful about making this asynchronous due to instructions getting out of sync
    let { Value, instructions } = self;
    if (instructions === undefined)
        instructions = [];
    const args = [];
    const instruction = {
        args
    };
    instructions.push(instruction);
    const val0 = Value[0];
    const test = tryParse(val0, reValueStatement);
    if (test === null)
        throw 'PE'; //Parse Error
    const { dependencies } = test;
    const splitDependencies = dependencies.split(',').map(x => x.trim());
    for (const dependency of splitDependencies) {
        const type = dependency[0];
        let prop = dependency.substring(1);
        let attr = undefined;
        if (type === '-') {
            attr = '-' + prop;
            prop = lispToCamel(prop);
        }
        const arg = {
            type,
            prop,
            attr,
        };
        args.push(arg);
    }
    //console.log({test, splitDependencies});
    return {
        instructions
    };
}
