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
    Checkbox 
} from 'antd';

const { Option } = Select;



const AddUpdateModal = (props) => {
    const { modalForm , visible , roleList , onSubmit , onCancel } = props
    const { formatMessage } = useIntl();
    const [agvForm] = Form.useForm()

    // matter handler
    const handleFinish = (values) => {
        if (onSubmit) {
          onSubmit(values);
        }
    };
    const handleSubmit = () => {
        if (!agvForm) return;
        agvForm.submit();
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
                return promise.reject(formatMessage({ id: 'deviceMgt.agvMgt.agvIpFormat' }));
            }
        }
        return promise.resolve();
    };
    const checkPassword= (_, value) => {
        const promise = Promise;
        if (value){
            let regText =/^\w[A-z0-9_]{5,}$/
            if(!regText.test(value)){
                return promise.reject('密码应是至少6位数字字母下划线，不能由下划线开头');
            }
        }
        return promise.resolve();
    };
    const checkIdCard=(_,v)=>{
        const promise=Promise;
        if(v){
            let regText=/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
            if(!regText.test(v)){
                return promise.reject('请输入正确的证件号码');
            }
        }
    }
    const checkTel=(_,v)=>{
        const promise=Promise;
        if(v){
            let regText=/^([1]\d{10}|([\(（]?0[0-9]{2,3}[）\)]?[-]?)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?)$/;
            if(!regText.test(v)){
                return promise.reject('请输入正确的电话/手机号码');
            }
        }
    }
    const checkAge=(_,v)=>{
        const promise=Promise;
        if(v){
            let regText=/^\d+$/;
            if(!regText.test(v)||v-0-Math.floor(v-0)>0){
                return promise.reject('年龄应是大于0的整数');
            }
            if(v-0>150){
                return promise.reject('年龄应该不会这么大');
            }
        }
    }

    const renderRoleList = ()=>{
        if(!roleList||!roleList.length){
            return (<>Null</>)
        }
        if(roleList.length>0){
            return roleList.map((item,index)=>{
            return  <Option value={item.roleName} key={item.roleId+'_'+index}>{item.roleName}<span style={{float:'right'}} key={item.roleName+'_'+item.roleName}>{item.roleId}</span></Option>
            })
        }else{
            return <></>
        }
    }
    const readerSexList=()=>{
        let sexlist=['男','女']
        return sexlist.map((item,index)=>{
            return  <Option value={item} key={item+'_'+index}>{item}</Option>
        })

    }
    const getModalContent = () =>{
        return (
            <Form form={agvForm} onFinish={handleFinish} className={styles.agvForm}>

                <Form.Item label="地址" name="address" >
                <Input placeholder="请输入地址" value={modalForm.address} autoComplete="off"/>
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
            onOk={handleSubmit}
            onCancel={onCancel}
        >
            {getModalContent()}
        </Modal>
      );
};

export default connect(({ loading }) => ({}))(AddUpdateModal);
