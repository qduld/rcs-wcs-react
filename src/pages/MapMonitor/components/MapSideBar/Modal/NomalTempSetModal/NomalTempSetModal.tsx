import React , { useEffect , useState } from 'react';
import { connect , Dispatch , useIntl } from 'umi';
import styles from './style.less';
import { Modal , Form , Card , Row , Col , Select , notification } from 'antd';
import { CloseSquareOutlined } from '@ant-design/icons';
import {  cmdTempInit , cmdTempInfoInit , cmdTempState } from '../../../data.d';

import ActionOrderList from '@/components/ActionOrder/ActionOrderList';
import CmdTempNumber from '../../CmdTempNumber/CmdTempNumber';

const { Option } = Select;

interface cmdTempSelectState{
    id?:number | string,
    templateName:string,
}

interface ModalProps {
    dispatch:Dispatch;
    visible: boolean;    //是否可见
    modalForm: any;
    allDDL: Array<object>;
    codeList: Array<object>;
    onSubmit: any;
    onCancel: () => void;
}

const NomalTempSetModal: React.FC<ModalProps> = (props) => {
    const { modalForm , visible , allDDL , codeList , onSubmit , onCancel } = props
    const { formatMessage } = useIntl();
    const [cmdTempNumberForm] = Form.useForm();           //模板数值填充Form
    let [cmdTempList, setCmdTempList] = useState<Array<cmdTempState>>([]);                     //模板列表
    let [cmdTempSelectList, setCmdTempSeleltList] = useState<Array<cmdTempSelectState>>([]);   //模板选择列表
    let [cmdTempActionList, setCmdTempActionList] = useState<Array<object>>([]);               //模板动作列表       

    const [tempForm] = Form.useForm();

    useEffect(() => {
        if(tempForm && !visible){
            tempForm.resetFields();
            cmdTempNumberForm.resetFields();
            setCmdTempList([]);
            setCmdTempActionList([]);
            setCmdTempSeleltList([]);
        }
    }, [visible]);

    useEffect(() => {
        if (modalForm) {
            tempForm.setFieldsValue({...modalForm});
        }
    }, [modalForm]);

    const handleFinish = (values: { [key: string]: any }) => {
        if (onSubmit) {
            onSubmit(values as cmdTempSelectState,cmdTempActionList);
        }
    };

    const handleSubmit = async () => {
        if (!tempForm || !cmdTempNumberForm) return;
        if(await tempForm.validateFields()){
            tempForm.submit();
            cmdTempNumberForm.submit();
        }
    };

    const commonRule = {
        required: true,
        message: formatMessage({ id: 'global.common.required' })
    }

    const searchTemplateList = ()=>{       //查询通用模板列表
        let { dispatch } = props
        dispatch({
            type: 'mapAndMonitor/getAllCmdTemplate',
            callback: (resp:any) => {
                if(resp){
                    setCmdTempList(resp)
                    setCmdTempSeleltList(orgCmdTemplate(resp))
                }
            }
        })  
    }

    const orgCmdTemplate = (tempList:Array<object>)=>{            //组装模板下拉选项
        return tempList.map((cmdItem:any)=>{
            let backItem = {} as cmdTempSelectState
            backItem.id = cmdItem.commandTemplate.id
            backItem.templateName = cmdItem.commandTemplate.templateName
            return backItem
        })
    }

    const changeTempSel = (tempId:any)=>{                         //模板选择回调
        let tempSelect = cmdTempList.find((item:cmdTempState)=>{
            return (item.commandTemplate.id==tempId)
        })
        if(tempSelect){
            setCmdTempActionList(orgTempCode(JSON.parse(JSON.stringify(tempSelect.commandTemplateInfos))))
        }
    }

    const orgTempCode = (cmdTempInfos:Array<object>)=>{           //将cmdGroup赋值给code
        return cmdTempInfos.map((tempItem:any)=>{
            tempItem.code = tempItem.cmdGroup.split('_')[1]
            return tempItem
        }) 
    }

    const deleteCmdTemp = ()=>{
        let {dispatch} = props
        let templateId = tempForm.getFieldValue('templateId')
        if(!templateId)return
        dispatch({
            type: 'mapAndMonitor/deleteCmdTemplate',
            payload: templateId,
            callback: (resp:any) => {
                if(resp.resultCode===200){
                    notification.success({
                        description: resp.resultMsg,
                        message: '删除成功',
                    });
                    tempForm.resetFields()
                    setCmdTempActionList([])
                    searchTemplateList()
                }else{
                    notification.success({
                        description: resp.resultMsg?resp.resultMsg:'请求失败',
                        message: '删除失败',
                    });
                }
            }
        })
    }

    return (
        <Modal
            title="通用模板设置"
            visible={visible}
            centered
            width={'60vw'}
            okText={'确定'}
            destroyOnClose
            onCancel={onCancel}
            onOk={handleSubmit}
            className={styles.nomalTempSetModal}
            >
            <Form form={tempForm}>
                        <Row gutter={16}>
                                <Form.Item label="选择模板" name="templateId" rules={[commonRule]}
                                    >
                                    <Select onFocus={searchTemplateList}
                                            onChange={(id:any)=>changeTempSel(id)} 
                                            placeholder='选择指定模板'>
                                            {cmdTempSelectList.map((item:any,index:any)=>{
                                                return <Option 
                                                    value={item.id} 
                                                    key={item.id+index}
                                                    >{item.templateName}</Option>
                                            })}
                                    </Select>
                                </Form.Item> 
                                <CloseSquareOutlined style={{fontSize:32,color:'#F84A03',cursor:'pointer',lineHeight:'1em',marginLeft:10}} 
                                    onClick={deleteCmdTemp}
                                    title={'删除'}/>
                        </Row>
                    </Form>
                    <div className={styles.cmdTempContent}>
                    <Row>
                        <Col span={8}>
                            <ActionOrderList
                                actionList = {cmdTempActionList}
                                ddlList = {allDDL}
                                optVisible = {false}
                            />
                        </Col>
                        <Col span={16}>
                            <CmdTempNumber
                                modalForm = {cmdTempNumberForm}
                                onSubmit = {handleFinish}
                                codeList = {codeList}
                                cmdTempInfos = {cmdTempActionList}
                            />
                        </Col>
                    </Row>
                    </div>
        </Modal>
      );
    };

export default connect(({ loading }: { loading: { effects: { [key: string]: boolean } } }) => ({}))(NomalTempSetModal);
