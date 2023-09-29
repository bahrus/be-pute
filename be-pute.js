import { BE, propDefaults, propInfo } from 'be-enhanced/BE.js';
import { XE } from 'xtal-element/XE.js';
import { register } from 'be-hive/register.js';
import { findRealm } from 'trans-render/lib/findRealm.js';
import { setItemProp } from 'be-linked/setItemProp.js';
import { getSignalVal } from 'be-linked/getSignalVal.js';
const cache = new Map();
const prsOnValuesCache = new Map();
const prsOnActionsCache = new Map();
export class BePute extends BE {
    static get beConfig() {
        return {
            parse: true,
            cache,
            parseAndCamelize: true,
            isParsedProp: 'isParsed'
        };
    }
    async onValues(self) {
        const { parsedFrom } = self;
        let parsed = prsOnValuesCache.get(parsedFrom);
        if (parsed === undefined) {
            const { prsValue } = await import('./prsValue.js');
            parsed = prsValue(self);
            prsOnValuesCache.set(parsedFrom, parsed);
        }
        return parsed;
    }
    async onProps(self) {
        const { parsedFrom } = self;
        let parsed = prsOnActionsCache.get(parsedFrom);
        if (parsed === undefined) {
            const { prsAction } = await import('./prsProps.js');
            parsed = prsAction(self);
            prsOnActionsCache.set(parsedFrom, parsed);
        }
        return parsed;
    }
    async importSymbols(self) {
        import('be-exportable/be-exportable.js');
        const { scriptRef, enhancedElement, nameOfExport } = self;
        const { findRealm } = await import('trans-render/lib/findRealm.js');
        const target = await findRealm(enhancedElement, scriptRef);
        if (target === null)
            throw 404;
        if (!target.src) {
            const { rewrite } = await import('./rewrite.js');
            rewrite(self, target);
        }
        const exportable = await target.beEnhanced.whenResolved('be-exportable');
        return {
            evaluate: exportable.exports[nameOfExport]
        };
    }
    async observe(self) {
        const { instructions, enhancedElement } = self;
        const args = instructions[0].args;
        for (const arg of args) {
            const { prop, type, attr } = arg;
            switch (type) {
                //TODO:  common code with be-switched -- move to be-linked
                case '$': {
                    const itemPropEl = await findRealm(enhancedElement, ['wis', prop]);
                    if (!itemPropEl)
                        throw 404;
                    if (itemPropEl.hasAttribute('contenteditable')) {
                        throw 'NI';
                    }
                    else {
                        import('be-value-added/be-value-added.js');
                        const beValueAdded = await itemPropEl.beEnhanced.whenResolved('be-value-added');
                        arg.signal = new WeakRef(beValueAdded);
                        beValueAdded.addEventListener('value-changed', e => {
                            evalFormula(self);
                        });
                    }
                    break;
                }
                case '@': {
                    const inputEl = await findRealm(enhancedElement, ['wf', prop]);
                    if (!inputEl)
                        throw 404;
                    arg.signal = new WeakRef(inputEl);
                    inputEl.addEventListener('input', e => {
                        evalFormula(self);
                    });
                    break;
                }
                case '#': {
                    const inputEl = await findRealm(enhancedElement, ['wrn', '#' + prop]);
                    if (!inputEl)
                        throw 404;
                    arg.signal = new WeakRef(inputEl);
                    inputEl.addEventListener('input', e => {
                        evalFormula(self);
                    });
                    break;
                }
                case '/': {
                    const host = await findRealm(enhancedElement, 'hostish');
                    if (!host)
                        throw 404;
                    import('be-propagating/be-propagating.js');
                    const bePropagating = await host.beEnhanced.whenResolved('be-propagating');
                    const signal = await bePropagating.getSignal(prop);
                    arg.signal = new WeakRef(signal);
                    signal.addEventListener('value-changed', e => {
                        evalFormula(self);
                    });
                    break;
                }
                case '-': {
                    const el = await findRealm(enhancedElement, ['upSearch', `[${attr}]`]);
                    if (!el)
                        throw 404;
                    debugger;
                }
            }
        }
        evalFormula(self);
    }
}
async function evalFormula(self) {
    const { evaluate, instructions, enhancedElement } = self;
    const inputObj = {};
    const [firstInstruction] = instructions;
    const args = firstInstruction.args;
    for (const arg of args) {
        const { signal, prop } = arg;
        const ref = signal?.deref();
        if (ref === undefined) {
            console.warn({ arg, msg: "Out of scope" });
            continue;
        }
        const val = getSignalVal(ref);
        inputObj[prop] = val;
    }
    const result = await evaluate(inputObj);
    const value = result?.value === undefined ? result : result.value;
    if (firstInstruction.isAction) {
        Object.assign(enhancedElement, value);
    }
    else {
        await setItemProp(enhancedElement, value, enhancedElement.getAttribute('itemprop'));
    }
}
const tagName = 'be-pute';
const ifWantsToBe = 'pute';
const upgrade = '*';
const xe = new XE({
    config: {
        tagName,
        isEnh: true,
        propDefaults: {
            ...propDefaults,
            scriptRef: 'previousElementSibling',
            nameOfExport: 'expr'
        },
        propInfo: {
            ...propInfo
        },
        actions: {
            onValues: {
                ifAllOf: ['isParsed', 'Value'],
            },
            onProps: {
                ifAllOf: ['isParsed', 'Props']
            },
            importSymbols: {
                ifAllOf: ['isParsed', 'nameOfExport', 'instructions', 'scriptRef']
            },
            observe: {
                ifAllOf: ['evaluate', 'instructions']
            }
        }
    },
    superclass: BePute
});
register(ifWantsToBe, upgrade, tagName);
