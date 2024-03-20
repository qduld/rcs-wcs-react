import React , { useState, useEffect , useRef } from 'react';
import { useIntl } from 'umi';
import {  Select , Row , Col , Form , Divider , Input } from 'antd';
import { CloseSquareOutlined , PlusOutlined , FormOutlined } from '@ant-design/icons';

const { Option } = Select;

interface PointSiteInputProps{
    modalForm:any, 
    action:any, 
    newPortName:any,
    portNameList:any, 
    portTypeList:any, 
    codeList:any,
    handleAction:any, 
    handleAddItem:any, 
    handelPortName:any, 
    handleEditPortName:any, 
    handlePortType:any, 
    handleSearchPortType:any, 
    enterEditMode:any, 
    handleCode:any, 
    handleCode1:any, 
    handleCode2:any, 
    handleDeleteAction:any
}

const PointSiteInput = React.forwardRef((props:PointSiteInputProps,ref) => {
    const { modalForm , action , newPortName , portNameList , portTypeList , codeList ,
         handleAction , handleAddItem , handelPortName , handleEditPortName , handlePortType , handleSearchPortType , enterEditMode , 
         handleCode , handleCode1 , handleCode2 , handleDeleteAction } = props

    const [editFlag,setEditFlag] = useState(false);
    const newPortRef = useRef(document.createElement('input'));

    const { formatMessage } = useIntl();

    useEffect(() => {
        if (action) {
            modalForm.setFieldsValue({...action});
        }
    }, [action]);

    const changeEditMode = (e:any)=>{
        setEditFlag(true)
        enterEditMode(e)
    }

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
            for(let key in action){
                if(key.indexOf('code')!=-1){
                    if(_.field === key){
                        continue;
                    }else if(value == action[key]){
                        return promise.reject(formatMessage({ id: 'mapMonitor.repeatCode' }));
                    }
                }
            }
        }
        return promise.resolve();
    };

    const renderPortTypeList = ()=>{
        if(portTypeList.length>0){
            return portTypeList.map((item:any)=>{
                return <Option value={item.ddlCode} key={item.ddlCode}>{item.ddlName}</Option>
            })
        }else{
            return <></>
        }
    }

    const handleAddItemBefore = ()=>{
        if(!newPortName){
            newPortRef.current.focus();
            return;
        }
        handleAddItem()
    }

    const labelCol = {span: 5, offset: 0}

    return (
        <Form  form={modalForm}
            labelAlign={"right"} 
            labelCol={labelCol}
            >
            <Form.Item label="动作名称"
                name="portName"
                rules={[
                    {
                        required:true,
                        message: '请输入名称',
                    }
                ]}
            >
                <Row gutter={8}>
                    <Col span={14}>
                        {!editFlag?
                            <Select value={action.portName} onChange={handleAction}
                                    dropdownRender={menu => (
                                        <div>
                                        {menu}
                                        <Divider style={{ margin: '4px 0' }} />
                                        <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
                                            <Input style={{ flex: 'auto' }} ref={newPortRef as any} value={newPortName} onChange={handelPortName} autoComplete="off"/>
                                            <a
                                            style={{ flex: 'none', padding: '8px', display: 'block', cursor: 'pointer' }}
                                            onClick={handleAddItemBefore}
                                            >
                                            <PlusOutlined/>新增
                                            </a>
                                        </div>
                                        </div>
                                    )}
                            >
                                {portNameList.map((item:any,index:number)=>{
                                    return <Option value={item.value+','+index} key={item.value+index}>{item.value}</Option>
                                })}
                            </Select>
                        :
                            <Input value={action.portName} 
                                autoComplete="off"
                                onChange={handleEditPortName} 
                                onBlur={()=>setEditFlag(false)}/>
                        }
                    </Col>
                    <FormOutlined style={{fontSize:32,color:'#1890ff',cursor:'pointer',lineHeight:'1em',marginLeft:10}} 
                        title={'编辑'} onClick={(e)=>{changeEditMode(e)}}/>
                    <CloseSquareOutlined style={{fontSize:32,color:'#F84A03',cursor:'pointer',lineHeight:'1em',marginLeft:10}} 
                        onClick={handleDeleteAction}
                        title={'删除'}/>
                </Row>
            </Form.Item>
            <Form.Item label="码值类型"
                name="portType"
                rules={[
                    {
                        required: true,
                        message: '请输入类型',
                    }
                ]}
            >
                <Select 
                    value={action.portType}
                    onChange={handlePortType}
                    onFocus={handleSearchPortType}>
                        {renderPortTypeList()}
                </Select>
            </Form.Item>
            <Form.Item label="必经码值" required>
                <Row gutter={8}>
                    <Col span={8}>
                        <Form.Item name="code" required dependencies={['code1','code2']} rules={[commonRule,{validator:checkCode}]}>
                            <Input value={action.code}  
                                onChange={handleCode} 
                                autoComplete="off"/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                            <Form.Item name="code1" dependencies={['code','code2']} rules={[{validator:checkCode}]}>
                                <Input 
                                    value={action.code1} 
                                    disabled={action.code?false:true} 
                                    onChange={handleCode1}
                                    autoComplete="off"
                                    placeholder='需先输入code'
                                    />
                            </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="code2" dependencies={['code','code1']} rules={[{validator:checkCode}]}>
                            <Input 
                                value={action.code2} 
                                disabled={action.code1?false:true} 
                                onChange={handleCode2}
                                autoComplete="off"
                                placeholder='需先输入code1'
                                />
                        </Form.Item>
                    </Col>
                </Row>
            </Form.Item>
        </Form>
      )
});

export default PointSiteInput;
