import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useIntl } from 'umi';
import { Button, Row, Col, List } from 'antd';
import styles from './style.less';
import usePrevious from '@/utils/customeEffect';
import { PlusOutlined } from '@ant-design/icons';
import { actionGroup, actionGroupInit } from '@/data/global.d'
import { LOStorage } from '@/utils/utils';


interface ActionOrderListProps {
    actionList: Array<Object>,
    optVisible?: boolean,
    addVisible?: boolean,
    normalVisible?: boolean,
    rowAddVisible?: boolean,
    addCallBack?: () => void,
    normalCallBack?: () => void,
    currentAction?: Object,
    updateActionGroup?: () => void,
    onSelectChange?: Function,
    ddlList: Array<Object>,
    unSelectable?: boolean,
    nomalDisable?: boolean,
}

interface groupItem extends actionGroup {
    agvId?: string,
    _exec?: boolean,
    actionLabel?: string
}

interface ddlItem {
    ddlCode: String,
    ddlName: String,
    id?: Number,
    keyword: String
}

const ActionOrderList = forwardRef((props: ActionOrderListProps, ref) => {
    const { actionList, ddlList, optVisible, addVisible, normalVisible, rowAddVisible, nomalDisable,
        addCallBack, normalCallBack, currentAction, onSelectChange, unSelectable, } = props
    const { formatMessage } = useIntl();
    let [selectFlag, setSelectFlag] = useState<Boolean>(true);
    let [actionListCache, setActionListCache] = useState<Array<groupItem>>([]);
    let [addBtnVis, setAddBtnVis] = useState('visible');
    let [normalBtnVis, setNormalBtnVis] = useState('visible');
    let [activeIdx, setActiveIdx] = useState(-1);
    const nowAgvState = JSON.parse(LOStorage.getItem('now_agv_state'))

    useImperativeHandle(ref, () => ({
        actionList: actionListCache,
        activeIdx: activeIdx,
        cancelSelect: cancelSelect
    }));

    let prevAction = usePrevious(currentAction);

    useEffect(() => {
        setActionListCache(orgActionGroup(actionList))
    }, [actionList, actionList.length])

    useEffect(() => {
        if (unSelectable === true) {
            setSelectFlag(false)
        } else {
            setSelectFlag(true)
        }
    }, [unSelectable])

    useEffect(() => {
        if (addVisible) {
            setAddBtnVis('block')
        } else {
            setAddBtnVis('none')
        }
    }, [addVisible])

    useEffect(() => {
        if (normalVisible) {
            setNormalBtnVis('block')
        } else {
            setNormalBtnVis('none')
        }
    }, [normalVisible])

    useEffect(() => {
        if (typeof onSelectChange == 'function') {
            onSelectChange(actionListCache, activeIdx)
        }
    }, [activeIdx])

    useEffect(() => {
        if (JSON.stringify(prevAction) != '{}') {
            let prewActIdx = actionListCache.findIndex((item) => item.id == prevAction.id)
            if (prewActIdx != -1) {
                actionListCache[prewActIdx]._exec = false
            }
        }
        if (JSON.stringify(currentAction) != '{}') {
            let curActIdx = actionListCache.findIndex((item) => item.id == currentAction.id)
            if (curActIdx != -1) {
                actionListCache[curActIdx]._exec = true
                setActionListCache(JSON.parse(JSON.stringify(actionListCache)))
            }
        }
    }, [currentAction])

    useEffect(() => {

    }, [actionListCache])
    // 处理高亮的逻辑
    useEffect(() => {
        if (actionListCache[0]) {
            for (let index = 0; index < nowAgvState.length; index++) {
                const nowAgvStateItem = nowAgvState[index];
                if (nowAgvStateItem.agvId == actionListCache[0].agvId) {
                    for (let i = 0; i < actionListCache.length; i++) {
                        const actionListCacheItem = actionListCache[i];
                        if (actionListCacheItem.actionLabel == nowAgvStateItem.actionLabel) {
                            actionListCache[i]._active = true
                            setActiveIdx(i)
                            break
                        } else {
                            actionListCache[i]._active = false
                            setActiveIdx(-1)
                        }
                    }
                }
            }
        }
    }, [nowAgvState, nowAgvState.length])

    const orgActionGroup = (list: any) => {
        let listBack = list.map((item: any, idx: any) => {
            item.actionLabel = item.code + '  ' + ddlNameFilter(item.ddlCode, item.keyword) + '  ' + (item.metadataName ? item.metadataName : '')
            item._active = false
            if (!item.actionName && item.keyword && item.ddlCode) {
                item.actionName = item.keyword + ',' + item.ddlCode
            }
            return item
        })
        if (activeIdx != -1 && listBack[activeIdx]) {
            listBack[activeIdx]._active = true
        }
        return listBack
    }

    const ddlNameFilter = (code: Number, keyword: String) => {
        let ddlCache = ddlList.find((item: any) => {
            return item.ddlCode === code && item.keyword === keyword
        }) as ddlItem
        if (ddlCache) {
            return ddlCache.ddlName
        } else {
            return code
        }
    }


    const selectGroupChange = (event: any, index: any) => {
        if (actionListCache[0].actionGroupId) {
            return
        } else {
            if (!selectFlag) { return; }
            let activeIdxBefore = -1
            event.stopPropagation()
            if (actionListCache) {
                activeIdxBefore = actionListCache.findIndex((item: any) => { return item._active === true })
            }
            if (activeIdxBefore === index) {
                actionListCache[index]._active = false
                setActiveIdx(-1)
            } else {
                if (activeIdxBefore !== -1) {
                    actionListCache[activeIdxBefore]._active = false
                }
                actionListCache[index]._active = true
                setActiveIdx(index)
            }
            setActionListCache(JSON.parse(JSON.stringify(actionListCache)))
        }
    }

    const selectDel = (index: any) => {
        if (actionListCache.length === 0) return;
        if (index === -1) return;
        actionListCache.splice(activeIdx, 1)
        setActiveIdx((--activeIdx))
        if (activeIdx != -1) { actionListCache[activeIdx]._active = true }
        setActionListCache(actionListCache)
    }

    const selectUp = (index: any) => {
        if (!index || index === -1) return;
        let midVal = {}
        midVal = actionListCache[index - 1]
        actionListCache[index - 1] = actionListCache[index]
        actionListCache[index] = midVal
        setActiveIdx(index - 1)
        setActionListCache(actionListCache)
    }

    const selectDown = (index: any) => {
        if (index == actionListCache.length - 1 || index === -1) return;
        let midVal = {}
        midVal = actionListCache[index + 1]
        actionListCache[index + 1] = actionListCache[index]
        actionListCache[index] = midVal
        setActiveIdx(index + 1)
        setActionListCache(actionListCache)
    }

    const classNameCompute = (item: any) => {
        let cnCache = ''
        if (item._active) {
            cnCache = styles.isActive
        }
        if (item._exec) {
            cnCache = styles.isExec
        }
        if (!item._active && !item._exec) {
            cnCache = styles.isDefault
        }
        return cnCache
    }

    const cancelSelect = (event?: any) => {
        if (event) {
            event.stopPropagation()
            if (event.target.type === 'button') {
                return;
            }
        }
        if (activeIdx === -1 || !actionListCache[activeIdx]) { return; }
        actionListCache[activeIdx]._active = false
        setActiveIdx(-1)
        setActionListCache(JSON.parse(JSON.stringify(actionListCache)))
    }

    const newRowDown = (event: any, index: number) => {
        event.stopPropagation()
        if (activeIdx !== -1) {
            actionListCache[activeIdx]._active = false
        }
        actionListCache.splice(index + 1, 0, Object.assign(actionGroupInit, { code: actionListCache[index].code, actionLabel: actionListCache[index].code + '', _active: true }))
        setActionListCache(JSON.parse(JSON.stringify(actionListCache)))
        setActiveIdx(index + 1)
    }

    return (
        <Row gutter={8} className={styles.actionOrder} onClick={(event: any) => cancelSelect(event)}>
            <Col span={optVisible ? 20 : 24} className={styles.list}>
                <List
                    size="small"
                    bordered
                    split={false}
                    dataSource={actionListCache}
                    renderItem={(item, index) =>
                        <List.Item
                            key={index}
                            className={classNameCompute(item)}
                            style={{ cursor: unSelectable ? 'auto' : 'pointer', borderBottom: '1px solid #DEDCDC' }}
                            onClick={(event: any) => selectGroupChange(event, index)}
                        >{item.actionLabel}
                            {rowAddVisible ?
                                <PlusOutlined className={styles.plusOneRow} title="向下新增一行" onClick={(e) => { newRowDown(e, index) }} />
                                : ''
                            }
                        </List.Item>}
                />
            </Col>
            {optVisible ?
                <Col span={4} className={styles.options}>
                    <Button
                        type="primary"
                        style={{ display: addBtnVis }}
                        onClick={addCallBack}>增加</Button>
                    <Button
                        disabled={typeof nomalDisable == 'boolean' ? nomalDisable : false}
                        type="primary"
                        style={{ display: normalBtnVis }}
                        onClick={normalCallBack}>通用</Button>
                    <Button
                        type="primary"
                        className={styles.delBtn}
                        onClick={() => { selectDel(activeIdx) }}>删除</Button>
                    <Button
                        type="primary"
                        className={styles.cancelBtn}
                        onClick={() => { cancelSelect() }}>取消</Button>
                    <Button onClick={() => selectUp(activeIdx)}>上移</Button>
                    <Button onClick={() => selectDown(activeIdx)}>下移</Button>
                </Col>
                : ''
            }
        </Row>
    );
});

ActionOrderList.defaultProps = {
    optVisible: true,
    addVisible: true,
    rowAddVisible: false
}


export default ActionOrderList;
