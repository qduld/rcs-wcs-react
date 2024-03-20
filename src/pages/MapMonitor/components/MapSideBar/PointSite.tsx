import React, { useEffect, useState, useRef } from 'react';
import { connect, Dispatch, useIntl } from 'umi';
import styles from './style.less';
import ActionOrderList from '@/components/ActionOrder/ActionOrderList';
import PointSiteInput from './PointSiteInput/PointSiteInput';
import { Modal, Card, Form, Input, Button, Select, Row, Col, notification } from 'antd';
import { action, cmdTempInit, cmdTempInfoInit, cmdTemp, cmdTempInfo } from '../data.d';
import { actionGroup, actionGroupInit, actionGroupRef, actionGroupRefInit } from '@/data/global.d'

import NomalTempNameModal from './Modal/NomalTempNameModal/NomalTempNameModal'
import NomalTempSetModal from './Modal/NomalTempSetModal/NomalTempSetModal'

const { Option, OptGroup } = Select;

interface PointSiteProps {
    actionList: Array<action>,
    dispatch: Dispatch,
    currentRegion: string,
    allDDL: Array<object>,
    codeMapList: Array<object>,
    updateActionList: (param: any) => void
}

const initAction = {
    action: {
        code: '',
        code1: '',
        code2: '',
        portType: '',
        portName: ''
    },
    actionGroup: [],
    type: ''
}

const PointSite: React.FC<PointSiteProps> = (props) => {
    const [pointSiteForm] = Form.useForm();
    const [actionGroupForm] = Form.useForm();
    const [tempNameForm] = Form.useForm();
    const [tempSetForm] = Form.useForm();

    const { actionList, currentRegion, codeMapList, updateActionList, allDDL } = props
    const { formatMessage } = useIntl();
    const [actionDiaVisible, setActDiaVisible] = useState(false);          //新增动作集弹框
    const [normalTempSetDiaVisible, setNormalTempSetDiaVisible] = useState(false);    //通用动作集弹框
    const [normalTempNameDiaVisible, setNormalTempNameDiaVisible] = useState(false);    //通用动作集弹框
    // let [editType,setEditType] = useState(true);       // 1 当前点,2 其他点
    // let [otherPointCode,setOtherPointCode] = useState();       // 1 当前点,2 其他点
    let [curAction, setCurAction] = useState<action>(JSON.parse(JSON.stringify(initAction)));      //当前的动作(包含动作和它下面的指令集)   
    let [curIdx, setCurIdx] = useState<number>(0);           //当前的动作标记
    let [newPortName, setNewPortName] = useState<string>();
    let [actionListCache, setActionListCache] = useState<Array<action>>([]);
    let [portNameList, setPortNameList] = useState([{ value: '' }]);

    let [portTypeList, setPortTypeList] = useState([]);      //接口返回的portType列表
    let [ddlList, setDDLList] = useState<Array<Array<object>>>([]);               //接口返回的ddl列表
    let [deviceList, setDeviceList] = useState([]);             //接口返回的door/chargePile列表
    let [cmdTempList, setCmdTempList] = useState([]);

    let [editPoNameIdx, setEditPoNameIdx] = useState(0);

    let [deviceDisabled, setDeviceDisabled] = useState(true);

    let [actionGroupMain, setActionGroupMain] = useState<Array<actionGroup>>([]);          //备份主区动作组
    let [actionGroupModal, setActionGroupModal] = useState<Array<actionGroup>>([]);        //备份弹框内动作组

    let actionGroupMainRef = useRef<actionGroupRef>(actionGroupRefInit)
    let actionGroupModalRef = useRef<actionGroupRef>(actionGroupRefInit);

    let [nomalBtnDis, setNomalBtnDis] = useState<boolean>(false);

    const _handleAddCallback = async () => {            //主区增加按钮点击逻辑
        if (await checkPointSiteForm()) { return; }
        setActDiaVisible(!actionDiaVisible)
        setActionGroupModal(actionGroupMainRef.current.actionList)            //从主区复制数据
        actionGroupForm.resetFields()                   //重置动作集表单数据 和 激活状态
        actionGroupForm.setFieldsValue({ code: curAction.action.code })
        if (actionGroupModalRef.current && actionGroupModalRef.current.activeIdx != -1) {
            actionGroupModalRef.current.actionList[actionGroupModalRef.current.activeIdx]._active = false
        }
    }

    const _handleNormalCallback = async () => {            //主区增加按钮点击逻辑
        if (await checkPointSiteForm()) { return; }
        setNormalTempSetDiaVisible(!normalTempSetDiaVisible)
    }

    const checkPointSiteForm = async () => {               //检测站点表单
        let errFlag = 0
        await pointSiteForm.validateFields().then((values: any) => {
        }).catch((errorInfo: any) => {
            notification.info({
                description: '动作条件输入有误',
                message: '新增无效',
            });
            errFlag = 1
        })
        return errFlag
    }

    useEffect(() => {              //前置查询工位类型
        searchPortType();
    }, [])

    useEffect(() => {
        setDDLList(orgDDLList(allDDL))
    }, [allDDL])

    useEffect(() => {                     //监听动作列表返回
        if (actionList.length > 0) {
            let acListCache = JSON.parse(JSON.stringify(actionList))
            orgPortName(actionList)
            setActionListCache(acListCache)                         //设置动作列表缓存
            setCurAction(acListCache[0])                            //设置当前动作
            setActionGroupMain(acListCache[0].actionGroup)          //设置主动作集
            setCurIdx(0)                                            //设置当前序号
        } else {
            setPortNameList([])
            setActionListCache([])
            setCurAction(JSON.parse(JSON.stringify(initAction)))
            setActionGroupMain([])
            setCurIdx(0)
        }
    }, [actionList])

    useEffect(() => {
        if (curAction.actionGroup.length != 0) {
            setNomalBtnDis(true)
        } else {
            setNomalBtnDis(false)
        }
    }, [curAction.actionGroup])

    const orgPortName = (dataList: any) => {         //组装所有的动作名称
        let anListCache = []
        for (let i = 0; i < dataList.length; i++) {
            let anType = dataList[i].action.portName
            anListCache.push({ value: anType })
        }
        setPortNameList(anListCache)
    }

    const searchPortType = () => {             //动态查询工位类型
        let { dispatch } = props;
        dispatch({
            type: 'mapAndMonitor/fetchPortType',
            callback: (resp: any) => {
                if (resp) {
                    setPortTypeList(resp)
                }
            }
        });
    }

    // const searchAllDdl = ()=>{             //动态查询工位类型
    //     let { dispatch } = props;
    //     dispatch({
    //         type: 'mapAndMonitor/fetchAllDDL',
    //         callback: (resp:any) => {
    //             if(resp){
    //                 setDDLList(orgDDLList(resp))
    //             }
    //         }
    //     });
    // }

    const searchAllDoor = () => {             //动态查询工位类型
        let { dispatch } = props;
        dispatch({
            type: 'mapAndMonitor/fetchDoor',
            callback: (resp: any) => {
                if (resp) {
                    setDeviceList(resp)
                }
            }
        });
    }

    const searchAllChargePile = () => {             //动态查询工位类型
        let { dispatch } = props;
        dispatch({
            type: 'mapAndMonitor/fetchChargePile',
            callback: (resp: any) => {
                if (resp) {
                    setDeviceList(resp)
                }
            }
        });
    }

    const searchDeviceType = () => {         //动态查询数据类型
        switch (actionGroupForm.getFieldValue('keyword')) {
            case 'device_door': searchAllDoor(); break;
            case 'charge_pile': searchAllChargePile(); break;
            case 'lift': searchAllDoor(); break;
            case 'trumpet': searchAllDoor(); break;
            case 'device_door_in': searchAllDoor(); break;
            default: setDeviceList([]);
        }
    }

    const orgDDLList = (dataList: any) => {           //组装字典表下拉数据
        let groupList = []
        let ddlListCache = [] as Array<Array<object>>
        // console.log(dataList)
        for (let i = 0; i < dataList.length; i++) {
            let kwCache = dataList[i].keyword
            let kwIdx = groupList.findIndex((item) => { return kwCache == item })
            if (kwIdx == -1) {
                groupList.push(kwCache)
                ddlListCache.push([])
                ddlListCache[ddlListCache.length - 1].push(dataList[i])
            } else {
                ddlListCache[kwIdx].push(dataList[i])
            }
        }
        return ddlListCache
    }

    const codeChange = (event: any) => {               //弹框动作集码值改变
        if (actionGroupModalRef.current) {
            if (actionGroupModalRef.current.activeIdx === -1) {
                let groupItem = actionGroupForm.getFieldsValue()
                for (let key in groupItem) {
                    groupItem[key] = ""
                }
                groupItem.code = event.currentTarget.value
                actionGroupForm.setFieldsValue(groupItem);
            }
        }
    }

    const keywordChange = async (value: any, option: any) => {    //弹框动作集动作名称改变
        await actionGroupForm.validateFields()
        actionGroupForm.setFieldsValue({ actionName: value, ddlCode: value.split(',')[1], keyword: option.keyword, metadataId: '', metadataName: '' })
        let activeIdx = actionGroupModalRef.current.activeIdx
        let actionGroup = actionGroupModalRef.current.actionList
        if (actionGroupForm.getFieldValue('keyword') != 'device_door' &&
            actionGroupForm.getFieldValue('keyword') != 'device_door_in' &&
            actionGroupForm.getFieldValue('keyword') != 'charge_pile' &&
            actionGroupForm.getFieldValue('keyword') != 'trumpet' &&
            actionGroupForm.getFieldValue('keyword') != 'lift') {
            setDeviceDisabled(true)
            if (activeIdx == -1) {               //当不是电梯,门和充电桩时才直接新增
                actionGroup = newActionGroup(actionGroup)
                console.log('可选择', actionGroupForm.getFieldValue('keyword'))
            }
        } else {
            setDeviceDisabled(false)
            console.log('不可选择', actionGroupForm.getFieldValue('keyword'))
        }
        if (activeIdx != -1) {
            actionGroup[activeIdx] = Object.assign(actionGroup[activeIdx], actionGroupForm.getFieldsValue())
        }
        setActionGroupModal(JSON.parse(JSON.stringify(actionGroup)))
    }

    const metadataChange = async (value: any, option: any) => {        //弹框动作集指定设备改变
        await actionGroupForm.validateFields()
        actionGroupForm.setFieldsValue({ metadataId: value, metadataName: option.metadataName })
        let activeIdx = actionGroupModalRef.current.activeIdx
        let actionGroup = actionGroupModalRef.current.actionList
        if (activeIdx == -1) {
            actionGroup = newActionGroup(actionGroup)
        } else {
            actionGroup[activeIdx] = Object.assign(actionGroup[activeIdx], actionGroupForm.getFieldsValue())
        }
        setActionGroupModal(JSON.parse(JSON.stringify(actionGroup)))
    }

    const newActionGroup = (group: Array<actionGroup>) => {            //新建动作集
        let formVal = actionGroupForm.getFieldsValue();
        let groupCache = Object.assign(Object.assign({}, actionGroupInit), formVal) as actionGroup
        let cmCache = codeMapList.find((item: any) => { return item.code_num == actionGroupForm.getFieldValue("code") }) as actionGroup
        if (cmCache) {
            groupCache.region = cmCache.region
        } else {
            groupCache.region = 'region' + Number(currentRegion)
        }
        group.push(groupCache)
        return group
    }

    const changePortType = (value: any) => {             //修改点类型
        curAction.action.portType = value
        setCurAction(Object.assign({}, curAction))
    }

    const changeCode = (e: any) => {                   //修改必经点
        curAction.action.code = e.target.value
        if (e.target.value == '') {
            curAction.action.code1 = ''
            curAction.action.code2 = ''
            pointSiteForm.setFieldsValue({ code1: '', code2: '' })
        }
        setCurAction(Object.assign({}, curAction))
    }

    const changeCode1 = (e: any) => {                 //修改必经点
        curAction.action.code1 = e.target.value
        if (e.target.value == '') {
            curAction.action.code2 = ''
            pointSiteForm.setFieldsValue({ code2: '' })
        }
        setCurAction(Object.assign({}, curAction))
    }

    const changeCode2 = (e: any) => {               //修改必经点
        curAction.action.code2 = e.target.value
        setCurAction(Object.assign({}, curAction))
    }

    const changeCurAction = (value: any, options: any) => {              //通过动作名称替换当前动作
        let index = value.split(',')[1]
        setCurIdx(index)
        setCurAction(actionListCache[index])
        setActionGroupMain(actionListCache[index].actionGroup)             //设置主区动作集
    }

    const changePortName = (e: any) => {                 //新增动作名称
        setNewPortName(e.target.value)
    }

    const changeCurPoName = (e: any) => {                  //编辑当前的动作名称
        curAction.action.portName = e.target.value
        setCurAction(Object.assign({}, curAction))
        portNameList[editPoNameIdx].value = e.target.value
        setPortNameList(portNameList.slice())
    }

    const enterEditMode = (e: any) => {                  //进入编辑模式
        if (curAction.action.portName && actionListCache.length > 0) {
            let poNameIdx = actionListCache.findIndex((item) => { return item.action.portName == curAction.action.portName })
            setEditPoNameIdx(poNameIdx)
        }
    }

    const addItem = (e: any) => {                            //新增动作
        // let init = JSON.parse(JSON.stringify(initAction))
        let init = JSON.parse(JSON.stringify(initAction))
        if (newPortName) {
            init.action.portName = newPortName
        } else {
            init.action.portName = '动作集' + (portNameList.length + 1)
            // return;
        }
        pointSiteForm.setFieldsValue({ portName: init.action.portName })
        // init.action.code = curAction.action.code
        init.type = 'insert'                            //新增类别判断
        portNameList.push({ value: init.action.portName })
        setPortNameList(portNameList.slice())
        setCurAction(init)
        setCurIdx(actionListCache.length)
        actionListCache.push(init)
        setActionListCache(actionListCache.slice())
        setActionGroupMain([])
        setNewPortName(undefined)
    }

    // const saveAction = async ()=>{                       //保存所有动作
    //     await pointSiteForm.validateFields()
    //     const { dispatch } = props;
    //     actionListCache[curIdx].actionGroup = actionGroupMainRef.current.actionList
    //     let reqData = JSON.parse(JSON.stringify(actionListCache))
    //     let unComplete = false
    //     if(reqData.length>0){
    //         for(let i=0;i<reqData.length;i++){
    //             if(reqData[i].action.id){
    //                 if(!completeTest(reqData)){
    //                     unComplete = true
    //                     break;
    //                 }
    //                 let alIdx = actionList.findIndex((item)=>{return item.action.id==reqData[i].action.id})
    //                 if(alIdx!=-1){
    //                     if(JSON.stringify(actionList[alIdx])!=JSON.stringify((cleanExtraProps(reqData[i])))){
    //                         reqData[i].type='update'
    //                     }else{
    //                         reqData[i].type=''
    //                     }
    //                 }
    //             }
    //         }
    //         if(unComplete)return;
    //         dispatch({
    //             type: 'mapAndMonitor/saveAction',
    //             payload:reqData,
    //             callback: (resp:any) => {
    //                 if(resp.resultCode===200){
    //                     notification.success({
    //                         description: resp.resultMsg,
    //                         message: '保存成功',
    //                     });
    //                     searchActionByCode()
    //                 }else{
    //                     notification.error({
    //                         description: resp.resultMsg,
    //                         message: '保存失败',
    //                     }); 
    //                 }
    //             }
    //         })
    //     }
    // }

    const saveActionSimple = async () => {                       //保存所有动作
        await pointSiteForm.validateFields()
        const { dispatch } = props;
        actionListCache[curIdx].actionGroup = actionGroupMainRef.current.actionList
        if (actionListCache[curIdx].actionGroup.length == 0) {
            // 问题点   加一个消息提示
            notification.info({
                description: '请至少保存一个动作',
                message: '保存失败',
            });
            return
        } else {
            let reqData = JSON.parse(JSON.stringify(actionListCache[curIdx]))
            if (reqData.action.id) {
                if (!completeTestSimple(reqData)) { return; }
                let alIdx = actionList.findIndex((item) => { return item.action.id == reqData.action.id })
                if (alIdx != -1) {
                    if (JSON.stringify(actionList[alIdx]) != JSON.stringify((cleanExtraProps(reqData)))) {
                        reqData.type = 'update'
                    } else {
                        reqData.type = ''
                    }
                }
            }
            if (!reqData.type) {
                notification.success({
                    description: '没有对应的修改',
                    message: '保存成功',
                });
                return;
            }
            dispatch({
                type: 'mapAndMonitor/saveAction',
                payload: reqData,
                callback: (resp: any) => {
                    if (resp.resultCode === 200) {
                        notification.success({
                            description: resp.resultMsg,
                            message: '保存成功',
                        });
                        // if(reqData.type==='insert'){
                        searchActionByCode()
                        // }
                    } else {
                        notification.error({
                            description: resp.resultMsg,
                            message: '保存失败',
                        });
                    }
                }
            })
        }

    }

    const saveNomalCmd = () => {
        if (actionGroupMainRef.current.actionList.length == 0) {
            notification.info({
                description: '没有有效动作集',
                message: '保存失败',
            });
        } else {
            searchTemplateList()
            setNormalTempNameDiaVisible(!normalTempNameDiaVisible)
        }
    }

    // const completeTest = (data:any)=>{
    //     if(data.find((item:any)=>{return !item.action.code})){
    //         notification.info({
    //             description: '存在不完整的动作集',
    //             message: '保存失败',
    //         }); 
    //         return false;
    //     }else{
    //         return true;
    //     }
    // }

    const completeTestSimple = (data: any) => {
        if (!data.action.code) {
            notification.info({
                description: '存在不完整的动作集',
                message: '保存失败',
            });
            return false;
        } else {
            return true;
        }
    }

    const cleanExtraProps = (data: any) => {       //去除了活跃标记和actionLabel显示,有待优化
        if (data.actionGroup.length > 0) {
            data.actionGroup.map((item: any) => {
                if (item.hasOwnProperty("_active")) {
                    delete item._active
                }
                if (item.hasOwnProperty("actionLabel")) {
                    delete item.actionLabel
                }
                if (item.hasOwnProperty("actionName")) {
                    delete item.actionName
                }
            })
        }
        return data
    }

    const searchActionByCode = () => {
        const { dispatch } = props
        if (dispatch) {
            dispatch({
                type: 'mapAndCanvas/fetchActionByCode',
                payload: curAction.action.code,
                callback: (codeData: any) => {
                    updateActionList(codeData)
                }
            })
        }
    }

    const searchTemplateList = () => {       //查询通用模板列表
        let { dispatch } = props
        dispatch({
            type: 'mapAndMonitor/getAllCmdTemplate',
            callback: (resp: any) => {
                if (resp) {
                    setCmdTempList(resp)
                }
            }
        })
    }

    const saveAndClose = () => {                     //保存并关闭
        if (actionGroupModalRef.current.actionList.find((item => { return !item.keyword || !item.ddlCode }))) {
            notification.info({
                description: '动作名称未配置',
                message: '保存失败',
            });
            return;
        }
        setActionGroupMain(actionGroupModalRef.current.actionList)
        let actionListC = JSON.parse(JSON.stringify(actionListCache))
        if (!actionListC[curIdx]) {
            actionListC[curIdx] = JSON.parse(JSON.stringify(curAction))
        }
        actionListC[curIdx].actionGroup = actionGroupModalRef.current.actionList
        setActionListCache(actionListC)
        setCurAction(actionListC[curIdx])
        setActDiaVisible(!actionDiaVisible)
    }

    const saveAndCloseNormalSet = (inputList: any, cmdTempList: Array<cmdTempInfo>) => {
        let actionCache = []
        let cmdTempListCache = JSON.parse(JSON.stringify(cmdTempList))
        let cmdNumCache = 0
        actionCache = cmdTempListCache.map((cmdItem: cmdTempInfo) => {
            for (let inKey in inputList) {
                if (inKey == cmdItem.cmdNumber) {
                    cmdNumCache = inputList[inKey]
                }
                cmdItem.code = cmdNumCache
            }
            let codeItem = codeMapList.find((item: any) => { return item.code_num == cmdItem.code }) as actionGroup
            if (codeItem) {
                cmdItem.region = codeItem.region
            }
            return cmdItem
        })
        curAction.actionGroup = actionCache
        // actionList[curIdx].actionGroup = actionCache
        setCurAction(curAction)
        if (!actionList[curIdx]) {
            actionList[curIdx] = JSON.parse(JSON.stringify(curAction))
        }
        setActionListCache(actionList)
        setActionGroupMain(curAction.actionGroup)
        setNormalTempSetDiaVisible(!normalTempSetDiaVisible)
    }

    const saveAndCloseNormalName = async (values: any) => {
        await tempNameForm.validateFields()
        let cmdTempInfos = [] as Array<any>
        actionGroupMainRef.current.actionList.forEach((item: any) => {
            let cmdTempItem = JSON.parse(JSON.stringify(cmdTempInfoInit))
            for (let key in item) {
                if (key in cmdTempItem) {
                    cmdTempItem[key] = item[key]
                }
            }
            cmdTempInfos.push(cmdTempItem)
        })
        let saveTemp = JSON.parse(JSON.stringify(cmdTempInit))
        saveTemp.commandTemplate.templateName = values.templateName
        saveTemp.commandTemplateInfos = cmdTempInfos
        saveCmdTemplate(saveTemp)
        setNormalTempNameDiaVisible(!normalTempNameDiaVisible)
    }

    const saveCmdTemplate = (reqParams: any) => {
        let { dispatch } = props;
        dispatch({
            type: 'mapAndMonitor/saveCmdTemplate',
            payload: reqParams,
            callback: (resp: any) => {
                if (resp.resultCode === 200) {
                    notification.success({
                        description: resp.resultMsg,
                        message: '保存成功',
                    });
                } else {
                    notification.success({
                        description: resp.resultMsg ? resp.resultMsg : '请求失败',
                        message: '保存失败',
                    });
                }
            }
        });
    }

    const selectChange = (actionGroupList: Array<actionGroup>, activeIdx: any) => {          //选择改变时
        if (activeIdx != -1) {
            if (!actionGroupList[activeIdx].actionName && actionGroupList[activeIdx].keyword && actionGroupList[activeIdx].ddlCode) {
                actionGroupList[activeIdx].actionName = actionGroupList[activeIdx].keyword + ',' + actionGroupList[activeIdx].ddlCode
            }
            actionGroupForm.setFieldsValue(sameKeyConcat(actionGroupForm.getFieldsValue(), actionGroupList[activeIdx]))
            if (actionGroupForm.getFieldValue('keyword') != 'device_door'
                && actionGroupForm.getFieldValue('keyword') != 'charge_pile'
                && actionGroupForm.getFieldValue('keyword') != 'trumpet'
                && actionGroupForm.getFieldValue('keyword') != 'lift'
                && actionGroupForm.getFieldValue('keyword') != 'device_door_in') {
                actionGroupForm.resetFields(['metadataId', 'metadataName'])
                setDeviceDisabled(true)
            } else {
                setDeviceDisabled(false)
            }
        } else {
            actionGroupForm.resetFields(['metadataId', 'metadataName', 'ddlCode', 'actionName', 'keyCode'])
        }
    }

    const sameKeyConcat = (obj1: Object, obj2: Object) => {
        let newObj = {}
        for (let key1 in obj1) {
            for (let key2 in obj2) {
                if (key1 == key2) {
                    newObj[key1] = obj2[key2]
                }
            }
        }
        return newObj
    }

    const deleteAction = () => {
        let { dispatch } = props;
        if (!curAction.action.id) {
            // let actionListCopy = JSON.parse(JSON.stringify(actionListCache))
            if (actionListCache.length > 0) {
                actionListCache.splice(curIdx, 1)
                portNameList.splice(curIdx, 1)
                setPortNameList(portNameList)
                setActionListCache(actionListCache)
                if (curIdx) {
                    setCurIdx(--curIdx)
                } else {
                    if (actionListCache.length > 0) {
                        setCurIdx(++curIdx)
                    } else {
                        pointSiteForm.resetFields()
                    }
                }
                if (actionListCache[curIdx]) {
                    setCurAction(actionListCache[curIdx])
                } else {
                    setCurAction(JSON.parse(JSON.stringify(initAction)))
                    setActionGroupMain([])
                }
            }
        } else {
            dispatch({
                type: 'mapAndMonitor/deleteActionGroup',
                payload: [curAction.action.id],
                callback: (resp: any) => {
                    if (resp.resultCode === 200) {
                        notification.success({
                            description: resp.resultMsg,
                            message: '删除成功',
                        });
                        searchActionByCode()
                    }
                }
            });
        }
    }

    const commonRule = {
        required: true,
        message: formatMessage({ id: 'global.common.required' })
    }

    const checkCode = (_: any, value: string) => {
        const promise = Promise;
        if (value) {
            if (!codeMapList.find((item: any) => { return item.code_num == value && item.position_flag != "#" })) {
                return promise.reject(formatMessage({ id: 'mapMonitor.validCode' }));
            }
        }
        return promise.resolve();
    }

    return (
        <div className={styles.pointSiteWrapper}>
            <Card title="动作条件管理" className={styles.coditionMgt}>
                <PointSiteInput
                    modalForm={pointSiteForm}
                    action={curAction.action}
                    newPortName={newPortName}
                    portNameList={portNameList}
                    portTypeList={portTypeList}
                    codeList={codeMapList}
                    handleAction={changeCurAction}
                    handleAddItem={addItem}
                    handelPortName={changePortName}
                    handleEditPortName={changeCurPoName}
                    handlePortType={changePortType}
                    handleSearchPortType={searchPortType}
                    handleCode={changeCode}
                    handleCode1={changeCode1}
                    handleCode2={changeCode2}
                    enterEditMode={enterEditMode}
                    handleDeleteAction={deleteAction}
                />
            </Card>
            <Card title="动作集管理" className={styles.actionMgt}>
                <ActionOrderList
                    actionList={actionGroupMain}
                    ddlList={allDDL}
                    addVisible={true}
                    normalVisible={true}
                    nomalDisable={false}
                    normalCallBack={() => _handleNormalCallback()}
                    addCallBack={() => _handleAddCallback()}
                    ref={actionGroupMainRef}
                />
            </Card>
            <Card className={styles.optionsBtn}>
                <Row gutter={24}>
                    <Button type="primary" onClick={saveNomalCmd}>保存通用指令</Button>
                    <Button type="primary" onClick={saveActionSimple}>保存</Button>
                </Row>
            </Card>
            <Modal
                title="动作管理"
                visible={actionDiaVisible}
                centered
                className={styles.actionDialog}
                width={'60vw'}
                okText={'确定'}
                onCancel={() => { _handleAddCallback() }}
                onOk={() => { saveAndClose() }}
                destroyOnClose={true}
            >
                <Form form={actionGroupForm} className={styles.actionDialogForm}>
                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item label="点位" name="code" rules={[commonRule, { validator: checkCode }]}>
                                <Input
                                    autoComplete="off"
                                    placeholder="请输入码值"
                                    onChange={codeChange}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="动作名称" name="actionName">
                                <Select
                                    onChange={keywordChange}
                                >
                                    {ddlList.map((outItem: any, outIdx) => {
                                        return <OptGroup
                                            label={outItem[0].keyword}
                                            key={outIdx + outItem[0].keyword}>
                                            {outItem.map((inItem: any, inIdx: any) => {
                                                return <Option
                                                    value={(inItem.keyword && inItem.ddlCode) ? inItem.keyword + ',' + inItem.ddlCode : ''}
                                                    key={inItem.keyword + inItem.ddlCode}
                                                    keyword={inItem.keyword}
                                                >{inItem.ddlName}</Option>
                                            })}
                                        </OptGroup>
                                    })}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="指定设备" name="metadataId">
                                <Select onFocus={searchDeviceType}
                                    onChange={metadataChange}
                                    disabled={deviceDisabled}
                                    placeholder='门和充电桩支持设备'>
                                    {deviceList.map((item: any) => {
                                        return <Option
                                            value={item.id}
                                            key={item.id}
                                            metadataName={item.deviceName}
                                            name={item.deviceName}>{item.deviceName}</Option>
                                    })}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name='metadataName' style={{ display: 'none' }}><Input /></Form.Item>
                    <Form.Item name='ddlCode' style={{ display: 'none' }}><Input /></Form.Item>
                    <Form.Item name='keyword' style={{ display: 'none' }}><Input /></Form.Item>
                </Form>
                <ActionOrderList
                    actionList={actionGroupModal}
                    ddlList={allDDL}
                    addVisible={false}
                    rowAddVisible={true}
                    ref={actionGroupModalRef}
                    onSelectChange={selectChange}
                />
            </Modal>
            {/* 通用模板名称弹窗 */}
            <NomalTempNameModal
                visible={normalTempNameDiaVisible}
                modalForm={tempNameForm}
                nameList={cmdTempList}
                onSubmit={saveAndCloseNormalName}
                onCancel={() => { setNormalTempNameDiaVisible(!normalTempNameDiaVisible) }}
            />
            {/* 通用模板设置弹窗 */}
            <NomalTempSetModal
                visible={normalTempSetDiaVisible}
                modalForm={tempSetForm}
                allDDL={allDDL}
                codeList={codeMapList}
                onSubmit={saveAndCloseNormalSet}
                onCancel={() => { setNormalTempSetDiaVisible(!normalTempSetDiaVisible) }}
            />
        </div>
    );
};

export default connect(({ loading }: { loading: { effects: { [key: string]: boolean } } }) => ({}))(PointSite);
