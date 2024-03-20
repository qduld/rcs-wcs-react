import React , { useEffect, useState , useRef } from 'react';
import { connect , Dispatch , useIntl } from 'umi';
import styles from '../style.less';
import { Modal , Form , Input , Select} from 'antd';
import { VoiceState } from '../data.d';

const { Option } = Select;

interface ModalProps {
    visible: boolean,    //是否可见
    modalForm: VoiceState;
    agvList: Array<object>;
    onSubmit: (values: VoiceState) => void;
    onCancel: () => void;
}

const AddUpdateModal: React.FC<ModalProps> = (props) => {
    const { modalForm , visible , agvList , onSubmit , onCancel } = props
    const { formatMessage } = useIntl();

    const [voiceForm] = Form.useForm()

    useEffect(() => {
        if(voiceForm && !visible){
            voiceForm.resetFields();
        }
    }, [visible]);

    useEffect(() => {
        if (modalForm) {
            voiceForm.setFieldsValue({...modalForm});
        }
    }, [modalForm]);

    const handleFinish = (values: { [key: string]: any }) => {
        if (onSubmit) {
          onSubmit(values as VoiceState);
        }
    };

    const handleSubmit = () => {
        if (!voiceForm) return;
        voiceForm.submit();
    };

    const handleChange = () => {
        let agvIdCache = voiceForm.getFieldValue('agvId')
        let agvCache = agvList.find((item:any)=>{return agvIdCache == item.agvId})
        if(agvCache){
            voiceForm.setFieldsValue({ip:agvCache.agvIp})
        }
    };
    
    const commonRule = {
        required: true,
        message: formatMessage({ id: 'global.common.required' })
    }

    const checkPort = (_: any, value: string) => {
        const promise = Promise;
        if (value){
            let regText = /^[1-9]\d*$/
            if(!(regText.test(value) && 1<=Number(value) && Number(value)<= 65535) ){
                return promise.reject(formatMessage({ id: 'deviceMgt.rcsMgt.portFormat' }));
            }
        }
        return promise.resolve();
    };

    const getModalContent = () =>{
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        };

        return (
            <Form form={voiceForm}
                {...formItemLayout}
                onFinish={handleFinish} 
                className={styles.voiceForm} 
                labelAlign="right">
                                <Form.Item label="设备名称" name="deviceName"
                                    rules={[commonRule]}>
                                    <Input autoComplete="off"/>
                                </Form.Item>
                                <Form.Item label="车辆Id" name="agvId"
                                    rules={[commonRule]}>
                                    <Select placeholder='车辆Id'
                                        onChange={handleChange}
                                        >
                                        {agvList.map((item:any)=>{
                                            return <Option 
                                                value={item.agvId} 
                                                key={item.agvId}
                                                >{(item.agvId+'').toUpperCase()}</Option>
                                        })}
                                    </Select>
                                </Form.Item>
                                <Form.Item label="IP" name="ip"
                                    rules={[commonRule]}>
                                    <Input disabled autoComplete="off"/>
                                </Form.Item>
                                <Form.Item label="端口" name="port"
                                    rules={[commonRule,
                                            {
                                                validator:checkPort
                                            }
                                    ]}
                                    >
                                    <Input placeholder="8080" autoComplete="off"/>
                                </Form.Item>
                                <Form.Item label="id" name="id" style={{display:'none'}}>
                                    <Input />
                                </Form.Item>
                    </Form>
        )
    }

    return (
            <Modal
                title="动作管理"
                visible={visible}
                centered
                className={styles.dialog}
                okText={'保存'}
                destroyOnClose
                onOk={handleSubmit}
                onCancel={onCancel}
                >
                {getModalContent()}
            </Modal>
      );
    };

export default connect(({ loading }: { loading: { effects: { [key: string]: boolean } } }) => ({}))(AddUpdateModal);
