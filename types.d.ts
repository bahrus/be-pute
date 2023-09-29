import { ActionOnEventConfigs } from "trans-render/froop/types";
import {IBE} from 'be-enhanced/types';
import {Target, Scope, ProxyPropChangeInfo} from 'trans-render/lib/types';
import {BVAAllProps} from 'be-value-added/types';
import {AP as BPAP, ISignal, Actions as BPActions} from 'be-propagating/types';
import {ElTypes, SignalRefType} from 'be-linked/types';

export interface EndUserProps extends IBE{
    Value?: Array<ValueStatement>;
    Props?: Array<PropsStatement>;
    scriptRef?: Target,
    nameOfExport?: string,
}

export interface Arg{
    prop?: string,
    attr?: string,
    type?: ElTypes,
    signal?: WeakRef<SignalRefType>,
}

export interface Instruction{
    args?: Array<Arg>;
    isAction?: boolean,
}


// //copied from be-switched.  share from ... where?
// export type SignalRefType = BVAAllProps | ISignal | HTMLElement;

export interface AllProps extends EndUserProps{
    isParsed?: boolean;
    evaluate?: (vals: any) => any;
    instructions?: Array<Instruction>;
}

export type ValueStatement = string;

export type PropsStatement = string;

export type AP = AllProps;

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export type POA = [PAP | undefined, ActionOnEventConfigs<PAP, Actions>];

export interface Actions{
    onValues(self: this): ProPAP;
    onProps(self: this): ProPAP;
    importSymbols(self: this): ProPAP;
    observe(self: this): Promise<void>;
}

export interface ParsedValueStatement{
    dependencies?: string,
}

export interface ParsedActionStatement{
    dependencies?: string,
}