import {BE, propDefaults, propInfo} from 'be-enhanced/BE.js';
import {BEConfig} from 'be-enhanced/types';
import {XE} from 'xtal-element/XE.js';
import {Actions, AllProps, AP, PAP, ProPAP, POA} from './types';
import {register} from 'be-hive/register.js';
import {AllProps as  BeExportableAllProps} from 'be-exportable/types';
import {findRealm} from 'trans-render/lib/findRealm.js';
import {BVAAllProps} from 'be-value-added/types';
import {setItemProp} from 'be-linked/setItemProp.js';
import {getSignalVal} from 'be-linked/getSignalVal.js';
import {Actions as BPActions} from 'be-propagating/types';

export class BeFor extends BE<AP, Actions> implements Actions{
    static override get beConfig(){
        return {
            parse: true,
            parseAndCamelize: true,
            isParsedProp: 'isParsed'
        } as BEConfig
    }

    async onValues(self: this) {
        //TODO:  cache like be-switched
        const {prsValue} = await import('./prsValue.js');
        const parsed = prsValue(self);
        return parsed as PAP;
    }

    async onActions(self: this){
        const {prsAction} = await import('./prsAction.js');
        const parsed = prsAction(self);
        return parsed as PAP;
    }

    async importSymbols(self: this): ProPAP {
        import('be-exportable/be-exportable.js');
        const {scriptRef, enhancedElement, nameOfFormula} = self;
        const {findRealm} = await import('trans-render/lib/findRealm.js');
        const target = await findRealm(enhancedElement, scriptRef!) as HTMLScriptElement | null;
        if(target === null) throw 404;
        if(!target.src){
            const {rewrite} = await import('./rewrite.js');
            rewrite(self, target);
        }
        const exportable = await (<any>target).beEnhanced.whenResolved('be-exportable') as BeExportableAllProps;
        return {
            formulaEvaluator: exportable.exports[nameOfFormula!]
        }
    }

    async observe(self: this){
        const {instructions, enhancedElement} = self;
        const args = instructions![0].args;
        for(const arg of args!){
            const {prop, type} = arg;
            switch(type){
                //TODO:  common code with be-switched -- move to be-linked
                case '$':{
                    const itemPropEl = await findRealm(enhancedElement, ['wis', prop!]) as HTMLElement;
                    if(!itemPropEl) throw 404;
                    if(itemPropEl.hasAttribute('contenteditable')){
                        throw 'NI'
                    }else{
                        import('be-value-added/be-value-added.js');
                        const beValueAdded = await  (<any>itemPropEl).beEnhanced.whenResolved('be-value-added') as BVAAllProps & EventTarget;
                        arg.signal = new WeakRef<BVAAllProps>(beValueAdded);
                        beValueAdded.addEventListener('value-changed', e => {
                            evalFormula(self);
                        });
                    }
                    break;
                }
                case '@':{
                    const inputEl = await findRealm(enhancedElement, ['wf', prop!]) as HTMLInputElement;
                    if(!inputEl) throw 404;
                    arg.signal = new WeakRef(inputEl);
                    inputEl.addEventListener('input', e => {
                        evalFormula(self);
                    });
                    break;
                }
                case '#':{
                    const inputEl = await findRealm(enhancedElement, ['wrn', '#' + prop!]) as HTMLInputElement;
                    if(!inputEl) throw 404;
                    arg.signal = new WeakRef(inputEl);
                    inputEl.addEventListener('input', e => {
                        evalFormula(self);
                    });
                    break;
                }
                case '/': {
                    const host = await findRealm(enhancedElement, 'hostish');
                    if(!host) throw 404;
                    import('be-propagating/be-propagating.js');
                    const bePropagating = await (<any>host).beEnhanced.whenResolved('be-propagating') as BPActions;
                    const signal = await bePropagating.getSignal(prop!);
                    arg.signal = new WeakRef(signal);
                    signal.addEventListener('value-changed', e => {
                        evalFormula(self);
                    });
                    break;
                }
            }
        }
        evalFormula(self);
    }


}

async function evalFormula(self: AP){
    const {formulaEvaluator, instructions, enhancedElement} = self;
    const inputObj: {[key: string]:  any} = {};
    const [firstInstruction] = instructions!;
    const args = firstInstruction.args;
    for(const arg of args!){
        const {signal, prop} = arg;
        const ref = signal?.deref();
        if(ref === undefined){
            console.warn({arg, msg: "Out of scope"});
            continue;
        }
        const val = getSignalVal(ref);
        inputObj[prop!] = val;
    }
    const result = await formulaEvaluator!(inputObj);
    const value = result?.value === undefined ? result : result.value;
    if(firstInstruction.isAction){
        Object.assign(enhancedElement, value);
    }else{
        await setItemProp(enhancedElement, value, enhancedElement.getAttribute('itemprop')!);
    }
    
}


export interface BeFor extends AllProps{}

const tagName = 'be-for';
const ifWantsToBe = 'for'
const upgrade = '*';

const xe = new XE<AP, Actions>({
   config: {
        tagName,
        isEnh: true,
        propDefaults:{
            ...propDefaults,
            scriptRef: 'previousElementSibling',
            nameOfFormula: 'formula'
        },
        propInfo: {
            ...propInfo
        },
        actions:{
            onValues: 'Value',
            onActions: 'Action',
            importSymbols: {
                ifAllOf: ['isParsed', 'nameOfFormula', 'instructions', 'scriptRef']
            },
            observe:{
                ifAllOf: ['formulaEvaluator', 'instructions']
            }
        }
   },
   superclass: BeFor
});

register(ifWantsToBe, upgrade, tagName);

