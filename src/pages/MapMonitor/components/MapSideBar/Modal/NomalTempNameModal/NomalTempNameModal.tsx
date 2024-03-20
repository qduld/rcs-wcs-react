import React , { useEffect } from 'react';
import { connect , Dispatch , useIntl } from 'umi';
import styles from './style.less';
import { Modal , Form , Input , notification } from 'antd';

interface TempNameModalState{
    templateName:string | null
}

interface ModalProps {
    visible: boolean,    //是否可见
    modalForm: any;
    nameList: Array<object>;
    onSubmit: (values: TempNameModalState) => void;
    onCancel: () => void;
}

const NomalTempNameModal: React.FC<ModalProps> = (props) => {
    const { modalForm , nameList , visible , onSubmit , onCancel } = props
    const { formatMessage } = useIntl();

    const [tempForm] = Form.useForm()

    useEffect(() => {
        if(tempForm && !visible){
            tempForm.resetFields();
        }
    }, [visible]);

    useEffect(() => {
        if (modalForm) {
            tempForm.setFieldsValue({...modalForm});
        }
    }, [modalForm]);

    const handleFinish = (values: { [key: string]: any }) => {
        if (onSubmit) {
          onSubmit(values as TempNameModalState);
        }
    };

    const checkName = (_: any, value: string) => {
        const promise = Promise;
        if (value){   
            if(nameList.find((item:any)=>{return item.commandTemplate.templateName == value})){
                return promise.reject(formatMessage({ id: 'mapMonitor.validRepeatName' }));
            }
        }
        return promise.resolve();
    };

    const commonRule = {
        required: true,
        message: formatMessage({ id: 'global.common.required' })
    }

    const handleSubmit = () => {
        if (!tempForm) return;
        tempForm.submit();
    };

    return (
        <Modal
            title="通用模板名称"
            visible={visible}
            centered
            width={'40vw'}
            okText={'确定'}
            destroyOnClose
            onCancel={onCancel}
            onOk={handleSubmit}
            >
            <Form form={tempForm} 
                onFinish={handleFinish} 
                >
                    <Form.Item label="模板名称" 
                        name="templateName"
                        rules={[commonRule,{
                            validator:checkName
                        }]}>
                        <Input 
                            autoComplete="off"
                            placeholder="请输入名称"
                            />
                    </Form.Item> 
            </Form>
        </Modal>
      );
    };

export default connect(({ loading }: { loading: { effects: { [key: string]: boolean } } }) => ({}))(NomalTempNameModal);
