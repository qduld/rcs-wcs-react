export interface actionGroup{
    id?: string,
    parentId?: string,
    childId?: string,
    metadataTable?: string,
    metadataId?: string,
    actionName?: string,
    code?: number,
    region?: string,
    keyword?: string,
    ddlCode?: string,
    eventType?: string,
    _active?:boolean,
    actionLabel?:string,
    cmdGroup?: string | null,
    cmdNumber?: string | null,
    templateId?: number,
}

export const actionGroupInit={
    id: '',
    parentId: '',
    childId: '',
    actionName: '',
    metadataTable: '',
    metadataId: '',
    code: 0,
    region: '',
    keyword: '',
    ddlCode: '',
    eventType: ''
}

export interface actionGroupRef{
    actionList:Array<actionGroup>,
    activeIdx:number,
    cancelSelect?:()=>void
}

export const actionGroupRefInit={
    actionList:[{_active:false}],
    activeIdx:0
}
