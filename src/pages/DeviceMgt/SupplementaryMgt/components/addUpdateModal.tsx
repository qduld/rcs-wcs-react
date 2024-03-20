import React, { useEffect } from 'react';
import { connect, useIntl } from 'umi';
import styles from '../style.less';
import { Modal, Form, Input, Radio } from 'antd';
import { SuppleState } from '../data.d';

interface ModalProps {
    visible: boolean,    //是否可见
    modalForm: SuppleState;
    onSubmit: (values: SuppleState) => void;
    onCancel: () => void;
}

const AddUpdateModal: React.FC<ModalProps> = (props) => {
    const { modalForm, visible, onSubmit, onCancel } = props
    const { formatMessage } = useIntl();

    const [suppleForm] = Form.useForm()

    useEffect(() => {
        if (suppleForm && !visible) {
            suppleForm.resetFields();
        }
    }, [visible]);

    useEffect(() => {
        if (modalForm) {
            suppleForm.setFieldsValue({ ...modalForm });
        }
    }, [modalForm]);

    const handleFinish = (values: { [key: string]: any }) => {
        if (onSubmit) {
            onSubmit(values as SuppleState);
        }
    };

    const handleSubmit = () => {
        if (!suppleForm) return;
        suppleForm.submit();
    };

    const commonRule = {
        required: true,
        message: formatMessage({ id: 'global.common.required' })
    }

    const checkIp = (_: any, value: string) => {
        const promise = Promise;
        if (value) {
            let regText = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/
            if (!regText.test(value)) {
                return promise.reject(formatMessage({ id: 'deviceMgt.rcsMgt.ipFormat' }));
            }
        }
        return promise.resolve();
    };

    const checkPort = (_: any, value: string) => {
        const promise = Promise;
        if (value) {
            let regText = /^[1-9]\d*$/
            if (!(regText.test(value) && 1 <= Number(value) && Number(value) <= 65535)) {
                return promise.reject(formatMessage({ id: 'deviceMgt.rcsMgt.portFormat' }));
            }
        }
        return promise.resolve();
    };

    const getModalContent = () => {
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        };

        return (
            <Form form={suppleForm}
                {...formItemLayout}
                onFinish={handleFinish}
                className={styles.suppleForm}
                labelAlign="right">
                <Form.Item label="设备名称" name="deviceName"
                    rules={[commonRule]}>
                    <Input autoComplete="off" />
                </Form.Item>
                <Form.Item label="IP" name="ip"
                    rules={[commonRule,
                        {
                            validator: checkIp
                        }
                    ]}>
                    <Input placeholder="127.0.0.1" autoComplete="off" />
                </Form.Item>
                <Form.Item label="端口" name="port"
                    rules={[commonRule,
                        {
                            validator: checkPort
                        }
                    ]}
                >
                    <Input placeholder="8080" autoComplete="off" />
                </Form.Item>
                <Form.Item label="设备类型" name="deviceType"
                    rules={[commonRule]}
                >
                    <Radio.Group>
                        <Radio value={"auto_door"}>自动门</Radio>
                        <Radio value={"auto_door1"}>卷帘门</Radio>
                        <Radio value={"wind_door"}>风淋门</Radio>
                        <Radio value={"lift"}>电梯</Radio>
                        {/* <Radio value={"1"}>充电桩</Radio> */}
                    </Radio.Group>
                </Form.Item>
                <Form.Item label="id" name="id" style={{ display: 'none' }}>
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
