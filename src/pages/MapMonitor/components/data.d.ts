export interface action{
    action:{
        id?:string | number | null | undefined,
        code:string | number | null,
        code1:string | number | null,
        code2:string | number | null,
        portType:string | number,
        portName:string | null
    },
    actionGroup:Array<actionGroup>,
    type:string | number
}

export interface cmdTemp{
    createTime?: string | null,
    id?: number | null,
    templateName: string | null,
}

export interface cmdTempInfo{
    cmdGroup: string | null,
    id: number,
    cmdNumber: string | null,
    code: string | number | null,
    ddlCode: string,
    keyword: string,
    metadataTable: string,
    templateId: number,
    region?: string,
}

export interface cmdTempState{
    commandTemplate:cmdTemp,
    commandTemplateInfos:Array<cmdTempInfo>
}

export const cmdTempInit={
    commandTemplate:{
        templateName:""
    },
    commandTemplateInfos:[]
}

export const cmdTempInfoInit={
    code:0,
    ddlCode:'',
    keyword:'',
    metadataTable:'',
}