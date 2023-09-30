import {AP, ProPAP, PAP, ParsedActionStatement, Arg, Instruction} from './types';
import {ElTypes} from 'be-linked/types';
import {RegExpOrRegExpExt} from 'be-enhanced/types';
import {arr, tryParse} from 'be-enhanced/cpu.js';

const reActionStatement: RegExpOrRegExpExt<ParsedActionStatement>[] = [
    {
        regExp: new RegExp(String.raw `^from(?<dependencies>.*)`),
        defaultVals: {}
    }
];

export function prsAction(self: AP) : PAP {
    //be careful about making this asynchronous due to args getting out of sync
    let {Props: Action, instructions} = self;
    if(instructions === undefined) instructions = [];
    const args: Array<Arg> = [];
    const instruction: Instruction = {
        args,
        isAction: true
    };
    instructions.push(instruction);
    const act0 = Action![0];
    const test = tryParse(act0, reActionStatement) as ParsedActionStatement;
    if(test === null) throw 'PE'; //Parse Error
    const {dependencies} = test;
    const splitDependencies = dependencies!.split(',').map(x => x.trim());
    for(const dependency of splitDependencies){
        const type = dependency[0] as ElTypes;
        const prop = dependency.substring(1);
        const arg: Arg = {
            type,
            prop
        };
        args.push(arg);
    }
    return {
        instructions
    };
}