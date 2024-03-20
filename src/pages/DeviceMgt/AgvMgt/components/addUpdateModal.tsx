import React, { useEffect, useState, useRef } from 'react';
import { connect, Dispatch, useIntl } from 'umi';
import styles from '../style.less';
import { Modal, Table, Form, Input, Button, Select, Row, Col, TimePicker, Checkbox } from 'antd';
import { ModalState } from '../data.d';
import moment from 'moment';

const { RangePicker } = TimePicker;
const { Option } = Select;

interface ModalProps {
    visible: boolean,    //是否可见
    modalForm: ModalState;
    codeList: Array<Object>,
    onSubmit: (values: ModalState, agvChargeTimeScope: any) => void;
    onCancel: () => void;
    timeList: Array<Object>
}


// const speedList = [
//     500,
//     600,
//     700,
//     800,
//     900,
//     1000,
//     1100,
//     1200,
//     1300,
//     1400,
//     1500,
//     1600,
//     1700
// ]
const AddUpdateModal: React.FC<ModalProps> = (props) => {
    const { modalForm, visible, codeList, onSubmit, onCancel, timeList } = props
    const { formatMessage } = useIntl();
    let [agvChargeTimeScope, setAgvChargeTimeScope] = useState<Array<any>>([])
    const [agvForm] = Form.useForm()
    const columns = [
        {
            title: '时间段',
            dataIndex: 'value',
            key: 'value',
        },
        {
            title: '操作',
            render: (chargeBL: any, record: any, index: number) => {
                return (
                    <Button onClick={() => handleRemove(index)}>清除</Button>
                )
            },
        },
    ]
    const handleRemove = (index: any) => {
        agvChargeTimeScope.splice(index, 1)
        setAgvChargeTimeScope(JSON.parse(JSON.stringify(agvChargeTimeScope)))
    }
    useEffect(() => {
        if (agvForm && !visible) {
            agvForm.resetFields();
        }
    }, [visible]);

    useEffect(() => {
        if (modalForm) {
            if (modalForm.agvChargeTimeScope && modalForm.agvChargeTimeScope.length > 0) {
                modalForm.agvChargeTimeScope.forEach(element => {
                    agvChargeTimeScope.push(element)
                });
                setAgvChargeTimeScope([...agvChargeTimeScope])
            }
            agvForm.setFieldsValue({ ...modalForm });
        }
    }, [modalForm]);

    const handleFinish = (values: { [key: string]: any }) => {
        if (onSubmit) {
            onSubmit(values as ModalState, agvChargeTimeScope)
            setAgvChargeTimeScope([])
        }
    };
    const handleCancel = () => {
        onCancel()
        setAgvChargeTimeScope([])
    }
    // 处理充电策略相关的逻辑
    const timeChange = (timeString: any, value: any): void => {
        const startTime = moment(timeString[0]._d + '').format('HH:mm:ss')
        const endTime = moment(timeString[1]._d + '').format('HH:mm:ss')
        const timeScope = startTime + '@' + endTime
        const timeScopeObj = { value: '' }
        timeScopeObj.value = timeScope
        agvChargeTimeScope.push(timeScopeObj)
        // setAgvChargeTimeScope(JSON.parse(JSON.stringify(agvChargeTimeScope)))

        setAgvChargeTimeScope([...agvChargeTimeScope])

    }


    const commonRule = {
        required: true,
        message: formatMessage({ id: 'global.common.required' })
    }


    const handleSubmit = () => {
        if (!agvForm) return;
        agvForm.submit();
    };

    const checkAgvIp = (_: any, value: string) => {
        const promise = Promise;
        if (value) {
            let regText = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/
            if (!regText.test(value)) {
                return promise.reject(formatMessage({ id: 'deviceMgt.agvMgt.agvIpFormat' }));
            }
        }
        return promise.resolve();
    };


    const checkAgvVoltageFull = (_: any, value: string) => {
        const promise = Promise;
        if (value || value === '0') {
            let regText = /^(([1-9]{1}\d*)|(0{1}))(\.\d*)?$/
            if (!regText.test(value)) {
                return promise.reject(formatMessage({ id: 'deviceMgt.agvMgt.agvPowerFormat' }));
            } else {
                if (Number(value) < Number(agvForm.getFieldValue('agvVoltageLow'))) {
                    return promise.reject(formatMessage({ id: 'deviceMgt.agvMgt.powerInvalid' }));
                }
            }
        }
        return promise.resolve();
    };

    const checkAgvVoltageLow = (_: any, value: string) => {
        const promise = Promise;
        if (value) {
            let regText = /^(([1-9]{1}\d*)|(0{1}))(\.\d*)?$/
            if (!regText.test(value)) {
                return promise.reject(formatMessage({ id: 'deviceMgt.agvMgt.agvPowerFormat' }));
            } else {
                if (Number(value) > Number(agvForm.getFieldValue('agvVoltageFull'))) {
                    return promise.reject(formatMessage({ id: 'deviceMgt.agvMgt.powerInvalid' }));
                }
            }
        }
        return promise.resolve();
    };

    const checkAgvVoltageWork = (_: any, value: string) => {
        const promise = Promise;
        if (value) {
            let regText = /^(([1-9]{1}\d*)|(0{1}))(\.\d*)?$/
            if (!regText.test(value)) {
                return promise.reject(formatMessage({ id: 'deviceMgt.agvMgt.agvPowerFormat' }));
            } else {
                if (Number(value) < Number(agvForm.getFieldValue('agvVoltageLow')) ||
                    Number(value) > Number(agvForm.getFieldValue('agvVoltageFull'))) {
                    return promise.reject(formatMessage({ id: 'deviceMgt.agvMgt.powerInvalid2' }));
                }
            }
        }
        return promise.resolve();
    };

    const renderCodeList = () => {
        if (codeList.length > 0) {
            return codeList.map((item: any, index) => {
                return <Option value={item.code} key={item.code + '_' + index}>{item.code}<span style={{ float: 'right' }} key={item.code + '_' + item.type}>{item.type}</span></Option>
            })
        } else {
            return <></>
        }
    }
    // const renderSpeedList = ()=>{
    //     if(speedList.length>0){
    //         return speedList.map((item:any,index)=>{
    //         return  <Option value={item} key={item+''+index}>{item}<span style={{float:'right'}} key={item+''+index}>{index}</span></Option>
    //         })
    //     }else{
    //         return <></>
    //     }
    // }
    const getModalContent = () => {
        return (
            <Form form={agvForm} onFinish={handleFinish} className={styles.agvForm}
            >
                <Row gutter={12}>
                    <Col span={12}>
                        <Form.Item label="车辆Id" name="agvId"
                            rules={[commonRule]}
                        >
                            <Input placeholder="请输入名称" value={modalForm.agvId} autoComplete="off" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="车辆IP" name="agvIp"
                            rules={[
                                commonRule,
                                {
                                    validator: checkAgvIp
                                }
                            ]}
                        >
                            <Input placeholder="请输入IP" value={modalForm.agvIp} autoComplete="off" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={12}>
                    <Col span={8}>
                        <Form.Item label="最高电压" name="agvVoltageFull"
                            dependencies={['agvVoltageLow']}
                            rules={[
                                commonRule,
                                {
                                    validator: checkAgvVoltageFull
                                }
                            ]}>
                            <Input placeholder="0" autoComplete="off" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="最低电压" name="agvVoltageLow"
                            dependencies={['agvVoltageFull']}
                            rules={[
                                commonRule,
                                {
                                    validator: checkAgvVoltageLow
                                }
                            ]}>
                            <Input placeholder="0" autoComplete="off" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="工作电压" name="agvVoltageWork"
                            dependencies={['agvVoltageFull', 'agvVoltageLow']}
                            rules={[
                                commonRule,
                                {
                                    validator: checkAgvVoltageWork
                                }
                            ]}>
                            <Input placeholder="0" autoComplete="off" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={12}>
                    <Col span={6}>
                        <Form.Item name="chargeEnable" valuePropName="checked">
                            <Checkbox>自动充电</Checkbox>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="orderWaitEnable" valuePropName="checked">
                            <Checkbox>自动返回待命</Checkbox>
                        </Form.Item>
                    </Col>
                    <Col span={6} style={{ display: 'none' }}>
                        <Form.Item name="agvStatus" valuePropName="checked">
                            <Checkbox>是否可用</Checkbox>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="agvEnable" valuePropName="checked">
                            <Checkbox>激活状态</Checkbox>
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item label="车辆权限" name="permissionCodeList" >
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="请选择二维码功能码值"
                        allowClear
                        optionLabelProp={"value"}
                    >
                        {renderCodeList()}
                    </Select>
                </Form.Item>
                <Form.Item label="充电策略"  >
                    <RangePicker picker={"time"}
                        onChange={timeChange}
                        allowClear={false}
                    />
                </Form.Item>
                <Form.Item label="已保存的充电策略" name="agvChargeTimeScope">
                    <Table
                        bordered={true}
                        dataSource={agvChargeTimeScope}
                        columns={columns}
                        rowKey={Math.random() + new Date().getTime() + ''}
                    ></Table>
                </Form.Item>
                {/* <Form.Item label="默认速度" name="agvSpeedList" >
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="请选择车辆默认速度"
                                    allowClear
                                    optionLabelProp={"value"}
                                    >
                                    {renderSpeedList()}
                                </Select>
                        </Form.Item> */}
            </Form>
        )
    }

    return (
        <Modal
            title="动作管理"
            visible={visible}
            centered
            className={styles.dialog}
            width={'60vw'}
            okText={'保存'}
            destroyOnClose
            onOk={handleSubmit}
            onCancel={handleCancel}
        >
            {getModalContent()}
        </Modal>
    );
};

export default connect(({ loading }: { loading: { effects: { [key: string]: boolean } } }) => ({}))(AddUpdateModal);
