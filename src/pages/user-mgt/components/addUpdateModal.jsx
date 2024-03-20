import React , { useEffect, useState , useRef } from 'react';
import { connect , Dispatch , useIntl } from 'umi';
import styles from '../styles/index.less';
import { 
    Modal ,
    Card ,
    Form ,
    Input ,
    Button ,
    Select ,
    Row ,
    Col ,
    notification ,
    Checkbox ,
    TreeSelect ,
} from 'antd';

const { Option } = Select;

const handleRoleChange=(option,onSetting)=>{
    if(!onSetting){
        return;
    }
    onSetting({target:{value:option.value}},null,'roleName')
    onSetting({target:{value:option.key}},null,'roleId')
}

const AddUpdateModal = (props) => {
    const { 
        modalForm , 
        onSetting , 
        visible , 
        roleList , 
        onSubmit , 
        onCancel ,
        initValues ,
    } = props
    const { formatMessage } = useIntl();
    const [userForm] = Form.useForm()

    // matter handler
    const handleFinish = () => {
        if (onSubmit) {
          onSubmit(modalForm);
        }
    };
    const handleSubmit = () => {
        if (!userForm) return;
        userForm.submit();
    };
    
    // form data checkers
    const commonRule = {
        required: true,
        message: formatMessage({ id: 'global.common.required' })
    }
    const checkUserName = (_, value) => {
        const promise = Promise;
        if (value){
            let regText =/.+/
            if(!regText.test(value)){
                return promise.reject(formatMessage({ id: 'userManage.modal.rule.name' }));
            }
        }
        return promise.resolve();
    };
    const checkPassword= (_, value) => {
        const promise = Promise;
        if (value){
            let regText =/^\w[A-z0-9_]{5,}$/
            if(!regText.test(value)){
                return promise.reject(formatMessage({ id: 'userManage.modal.rule.password' }));
            }
        }
        return promise.resolve();
    };
    const checkIdCard=(_,v)=>{
        const promise=Promise;
        if(v){
            let regText=/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
            if(!regText.test(v)){
                return promise.reject(formatMessage({ id: 'userManage.modal.rule.idCard' }));
            }
        }
    }
    const checkTel=(_,v)=>{
        const promise=Promise;
        if(v){
            let regText=/^([1]\d{10}|([\(（]?0[0-9]{2,3}[）\)]?[-]?)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?)$/;
            if(!regText.test(v)){
                return promise.reject(formatMessage({ id: 'userManage.modal.rule.tel' }));
            }
        }
    }
    const checkAge=(_,v)=>{
        const promise=Promise;
        if(v){
            let regText=/^\d+$/;
            if(!regText.test(v)||v-0-Math.floor(v-0)>0){
                return promise.reject(formatMessage({ id: 'userManage.modal.rule.age.int' }));
            }
            if(v-0>150){
                return promise.reject(formatMessage({ id: 'userManage.modal.rule.age.limit' }));
            }
        }
    }

    const renderRoleList = ()=>{
        if(!roleList||!roleList.length){
            return (<>Null</>)
        }
        if(roleList.length>0){
            return roleList.map((item,index)=>{
            return  <Option value={item.roleName} key={item.roleId}>{item.roleName}<span style={{float:'right'}} key={index+'_'+item.roleName}>{item.roleId}</span></Option>
            })
        }else{
            return <></>
        }
    }
    const readerSexList=()=>{
        let sexlist=[1,0]
        return sexlist.map((item,index)=>{
            return  <Option value={item==1?'男':'女'} key={item+'_'+index}>{item==1?'男':'女'}</Option>
        })
    }
    const getModalContent = () =>{
        
        return (
            <Form form={userForm} 
                initialValues={initValues}
                onFinish={handleFinish} 
                className={styles.userForm}
            >
                <Row gutter={12}>
                    <Col  span={12}>
                        <Form.Item label="用户名称" name="username"
                                rules={[
                                    commonRule,
                                    {
                                        validator:checkUserName
                                    }
                                ]}
                            >
                            <Input placeholder="请输入用户名" 
                            value={modalForm.username}
                            onChange={({nativeEvent:e})=>{onSetting(e,null,'username')}}
                             autoComplete="off"/>
                        </Form.Item>
                    </Col>
                    <Col  span={12}>
                        <Form.Item label="用户密码" name="password"
                                rules={[
                                    commonRule,
                                    {
                                        validator:checkPassword
                                    }
                                ]}
                            >
                            <Input placeholder="请设置密码" 
                            value={modalForm.password}
                            
                            onChange={({nativeEvent:e})=>{onSetting(e,null,'password')}}
                             autoComplete="off"/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={12}>
                    <Col  span={12}>
                        <Form.Item label="性别" name="sex" >
                            <Select
                                style={{ width: '100%' }}
                                placeholder="请选择性别"
                                allowClear
                                optionLabelProp={"value"}
                            >
                                {readerSexList()}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col  span={12}>
                        <Form.Item label="联系电话" name="tel"
                            rules={[
                                {
                                    validator:checkTel
                                }
                            ]}
                         >
                            <Input placeholder="请输入联系电话" 
                            value={modalForm.tel}
                            onChange={({nativeEvent:e})=>{onSetting(e,null,'tel')}}
                             autoComplete="off"/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={12}>
                    <Col  span={12}>
                        <Form.Item label="身份证" name="idCard"
                                rules={[
                                    {
                                        validator:checkIdCard
                                    }
                                ]}
                            >
                            <Input placeholder="请输入身份证号" 
                            value={modalForm.idCard}
                            onChange={({nativeEvent:e})=>{onSetting(e,null,'idCard')}}
                             autoComplete="off"/>
                        </Form.Item>
                    </Col>
                    <Col  span={12}>
                        <Form.Item label="年龄" name="age" 
                            rules={[{validator:checkAge}]}
                        >
                            <Input placeholder="请输入年龄" 
                            value={modalForm.age}
                            onChange={({nativeEvent:e})=>{onSetting(e,null,'age')}}
                             autoComplete="off"/>
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item label="地址" name="address" >
                <Input placeholder="请输入地址" 
                value={modalForm.address}
                onChange={({nativeEvent:e})=>{onSetting(e,null,'address')}}
                 autoComplete="off"/>
                </Form.Item>
                <Form.Item label="角色" name="roleId" 
                    rules={[commonRule]}
                >
                        <Select
                            style={{ width: '100%' }}
                            placeholder="请选择权限角色"
                            allowClear
                            optionLabelProp={"label"}
                            onChange={(v,option)=>{
                                handleRoleChange(option,onSetting)
                            }}
                        >
                            {renderRoleList()}
                        </Select>
                </Form.Item>
            </Form>
        )
    }

    return (
        <Modal
            title="用户管理"
            visible={visible}
            centered
            className={styles.dialog}
            width={'60vw'}
            okText={'保存'}
            destroyOnClose
            onOk={handleFinish}
            onCancel={(e)=>{onCancel(e);userForm.resetFields()}}
        >
            {getModalContent()}
        </Modal>
      );
};

export default connect(({ loading }) => ({}))(AddUpdateModal);
