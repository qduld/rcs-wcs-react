import React , { useState, useEffect , useRef } from 'react';
import { useIntl } from 'umi';
import { Form , Input , List } from 'antd';
import styles from './style.less';
import { check } from 'prettier';

interface CmdTempNumberProps{
    modalForm:any, 
    cmdTempInfos:any,
    onSubmit:any,
    codeList:Array<object>,
}

const CmdTempNumber = React.forwardRef((props:CmdTempNumberProps,ref) => {
    const { modalForm , cmdTempInfos , codeList , onSubmit } = props

    const { formatMessage } = useIntl();

    useEffect(() => {
        if(modalForm){
            modalForm.resetFields();
        }
    }, []);

    const commonRule = {
        required: true,
        message: formatMessage({ id: 'global.common.required' })
    }

    const checkCode = (_: any, value: string) => {
        const promise = Promise;
        if (value){   
            if(!codeList.find((item:any)=>{return item.code_num == value && item.position_flag!="#"})){
                return promise.reject(formatMessage({ id: 'mapMonitor.validCode' }));
            }
            if(checkRepeat(_.field,value)){
                return promise.reject(formatMessage({ id: 'mapMonitor.repeatCode' }));
            }
        }
        return promise.resolve();
    };

    const checkRepeat = (fieldName:string,fieldVal:any)=>{
        let inputObjList = modalForm.getFieldsValue()
        let repeatFlag = false
        for(let key in inputObjList){
            if(key!=fieldName){
                if(inputObjList[key]==fieldVal){
                    repeatFlag=true
                    break;
                }
            }
        }
        return repeatFlag
    }
    
    const renderCmdTempItem = ()=>{
       let cmdTempCache = [] as any
       cmdTempInfos.forEach((formItem:any,index:number)=>{
           if( index == 0 || formItem.cmdGroup != cmdTempInfos[index-1].cmdGroup){
                    cmdTempCache.push (<Form.Item label={formItem.code}
                        key={formItem.id+index}
                        id={formItem.id+index}
                        name={formItem.cmdNumber}
                        dependencies={Object.keys(modalForm.getFieldsValue())}
                        rules={[commonRule,{validator:checkCode}]}
                        >
                            <Input 
                                key={formItem.id+index+'input'}
                                id={formItem.id+index+'input'}
                                name={formItem.cmdNumber}
                                autoComplete="off"
                                placeholder="请输入Code"
                                />
                        </Form.Item>)    
           }
       })
       return cmdTempCache
    }

    const labelCol = {span: 5, offset: 0}

    return (
        <div className={styles.cmdTempInput}>
            {cmdTempInfos.length>0?
                <Form form={modalForm}
                    onFinish={onSubmit}
                    labelAlign={"right"} 
                    labelCol={labelCol}
                    >
                    {renderCmdTempItem()}
                </Form>:
                <List/>
            }

        </div>
      )
});

export default CmdTempNumber;
