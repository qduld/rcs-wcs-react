import React, { useEffect, useState, useRef, useCallback } from 'react';
import { connect, Dispatch, useIntl } from 'umi';
import styles from './style.less';
import { Card, Form, Input, Button, Select, Row, Col, notification } from 'antd';
import ActionOrderList from '@/components/ActionOrder/ActionOrderList';
import PowerShow from '@/components/SVG/PowerShow';
import usePrevious from '@/utils/customeEffect';
import { AgvInfoState, agvInfoInit } from '@/components/MapPartComponents/data.d';

const { Option } = Select;

interface AgvProps {
    actionList: Array<object>,
    allAgvList: string,
    loading: boolean,
    dispatch: Dispatch,
    currentRegion: string,
    codeMapList: Array<object>,
    allDDL: Array<object>,
    updateActionList: () => void,
}

interface PowerInfoProps {
    percent: number,
    color: string,
    charging?: boolean
}

interface PathStartEndState {
    startCode: string | number,
    endCode: string | number,
}

interface AgvVolSetState {
    agvId: string,
    agvVoltageLow: number,
    agvVoltageFull: number,
}

const PathStartEndInit = {
    startCode: '',
    endCode: '',
}

const powerInfoInit = {
    percent: 0,
    color: 'white',
}

const AgvRunning: React.FC<AgvProps> = (props) => {
    const { allAgvList, dispatch, currentRegion, codeMapList, updateActionList, allDDL } = props;

    let [agvStatus, setAgvStatus] = useState<Array<AgvInfoState>>([]);
    let [actionGroup, setActionGroup] = useState<Array<Object>>([]);
    let [currentAgv, setCurrentAgv] = useState<AgvInfoState>(agvInfoInit);
    let [agvList, setAgvList] = useState<Array<object>>([]);
    let [currentAction, setCurrentAction] = useState<Array<Object>>([]);
    let [ddlList, setDDLList] = useState<Array<Array<object>>>([]);               //接口返回的ddl列表
    let [powerInfo, setPowerInfo] = useState<PowerInfoProps>(powerInfoInit);
    let [pathStartEnd, setPathStartEnd] = useState<PathStartEndState>(PathStartEndInit);

    let prevAgvList: (string | any) = usePrevious(allAgvList);
    let agvVolSet = useRef<Array<AgvVolSetState>>([]);

    useEffect(() => {
        getAllAgv()
        getAllAgvStatus()
    }, [])

    useEffect(() => {
        setDDLList(orgDDLList(allDDL))
    }, [allDDL])

    useEffect(() => {
        if (prevAgvList && allAgvList) {
            let preAgvListObj = JSON.parse(prevAgvList)
            let allAgvListObj = JSON.parse(allAgvList)
            setAgvList(allAgvListObj)
            // agvListCur.current = allAgvListObj
            orgAgvStatus(agvStatus)
            for (let agvId in preAgvListObj) {
                if (preAgvListObj[agvId].agv_state != allAgvListObj[agvId].agv_state) {            //如果有小车从空闲变成非空闲状态就调用一次Agv状态接口
                    // if( allAgvListObj[agvId].agv_state != 0 ){
                    getAllAgvStatus()
                    break;
                    // }
                }
            }
        }
    }, [allAgvList])

    useEffect(() => {
        if (currentAgv.agvId) {
            let agvStatusCache = agvStatus.find((item: any) => { return item.agvId == currentAgv.agvId })
            setCurrentAgv(Object.assign(currentAgv, agvStatusCache))
        }
    }, [agvStatus])
    const getAllAgvStatus = () => {               //获取所有Agv状态
        const { dispatch } = props
        dispatch({
            type: 'homeAndMonitor/fetchAgvStatus',
            callback: (resp: any) => {
                if (resp) {
                    setAgvStatus(orgAgvStatus(resp))
                }
            }
        });
    }

    const getAgvPathList = (agvId: string) => {
        const { dispatch } = props
        dispatch({
            type: 'deviceAndMonitor/fetchAgvPathList',
            payload: agvId,
            callback: (resp: any) => {
                if (resp) {
                    setPathStartEnd(orgPathStartEnd(resp[0]))
                    setActionGroup(resp)
                } else {
                    setPathStartEnd(JSON.parse(JSON.stringify(PathStartEndInit)))
                    setActionGroup([])
                }
            }
        });
    }

    const getAllAgv = () => {
        const { dispatch } = props;
        if (dispatch) {
            dispatch({
                type: 'agvMgt/fetchAllAgv',
                callback: (agvList: any) => {
                    agvVolSet.current = agvList
                }
            })
        }
    }

    const orgPathStartEnd = (backPath: object) => {
        let pathBack = JSON.parse(JSON.stringify(PathStartEndInit))
        let pathArr = backPath.path.split(',');
        pathBack.startCode = pathArr[0]
        pathBack.endCode = pathArr[pathArr.length - 1]
        return pathBack
    }

    const orgAgvStatus = (statusData: Array<AgvInfoState>) => {      //赋值Key 根据Id排序 
        let listStatusBack = []
        let listData = agvList
        if (!listData || JSON.stringify(listData) == '{}') {
            listStatusBack = statusData.map((item: any, index: number) => {
                item.key = item.agvId + index
                item = Object.assign(JSON.parse(JSON.stringify(agvInfoInit)), item)
                return item
            }).sort(function compareAgvId(prev, curr) {
                return Number(prev.agvId.match(/\d+/g)[0]) - Number(curr.agvId.match(/\d+/g)[0])
            })
        } else {
            listStatusBack = statusData.map((item: any, index: number) => {
                if (listData[item.agvId]) {
                    item.voltage = listData[item.agvId].voltage
                    item.agvCode = listData[item.agvId].code
                }
                item.missionName = item.missionName ? item.missionName : '空闲'
                return item
            }).sort(function compareAgvId(prev, curr) {
                return Number(prev.agvId.match(/\d+/g)[0]) - Number(curr.agvId.match(/\d+/g)[0])
            })
        }
        return listStatusBack
    }


    const orgDDLList = (dataList: any) => {           //组装字典表下拉数据
        let groupList = []
        let ddlListCache = [] as Array<Array<object>>
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

    const computePower = (powerArg: string | number, agvId: string) => {
        let percentCompute = 0
        let color = "#95F204"
        let powerNum = Number(powerArg)
        let volSetFilter = agvVolSet.current.find((item: any) => {
            return item.agvId === agvId
        })
        let volLowPecent = 30
        let volFulPecent = 90
        let volLow = 0
        let volFul = 0
        if (volSetFilter) {
            if (volSetFilter.agvVoltageLow >= 0) {
                volLow = volSetFilter.agvVoltageLow
            }
            if (volSetFilter.agvVoltageFull >= 0) {
                volFul = volSetFilter.agvVoltageFull
            }
        }
        if (powerNum) {
            if (powerNum < 30) {
                percentCompute = Math.floor((powerNum - 22) / 0.07)
                volLowPecent = Math.floor((volLow - 22) / 0.07)
                volFulPecent = Math.floor((volFul - 22) / 0.07)
            } else if (powerNum > 30) {
                percentCompute = Math.floor((powerNum - 40) / 0.14)
                volLowPecent = Math.floor((volLow - 40) / 0.14)
                volFulPecent = Math.floor((volFul - 40) / 0.14)
            }
            if (percentCompute < 0) {
                percentCompute = 0
            } else if (percentCompute > 100) {
                percentCompute = 100
            }
        }
        if (percentCompute >= 0 && percentCompute < volLowPecent) {
            color = "#D9001B"
        } else if (percentCompute >= volLowPecent && percentCompute < volFulPecent) {
            color = "#70B603"
        } else {
            color = "#95F204"
        }
        return { percent: percentCompute, color: color }
    }

    const selectCurrentAgv = (agvId: string) => {
        let curAgvCache = agvStatus.find((item: AgvInfoState) => {
            return item.agvId === agvId
        })
        if (curAgvCache) {
            setCurrentAgv(curAgvCache)
            setPowerInfo(computePower(curAgvCache.voltage, agvId))
            getAgvPathList(agvId)
        }
    }

    const renderAgvList = () => {
        return agvStatus.map((item: AgvInfoState, index: number) => {
            return <Option value={item.agvId} key={item.agvId + index}>{item.agvId.toUpperCase()}</Option>
        })
    }

    return (
        <div className={styles.agvRunningWrapper}>
            <Card title="定位AGV" className={styles.locationAgv}>
                <Form.Item label="选择车辆">
                    <Select
                        value={currentAgv.agvId}
                        onChange={(e: any) => { selectCurrentAgv(e) }}
                    >
                        {renderAgvList()}
                    </Select>
                </Form.Item>
            </Card>
            <Card title="AGV状态" className={styles.agvStatus}>
                <Form>
                    <Form.Item label="电量显示">
                        <PowerShow
                            powerInfo={powerInfo}
                        />
                        <span style={{ marginLeft: '20px' }}>{powerInfo.percent + '%'}</span>
                    </Form.Item>
                    <Form.Item label="当前码值">
                        <span>{currentAgv.agvCode}</span>
                    </Form.Item>
                    <Form.Item label="当前状态">
                        <span>{currentAgv.agvId ? currentAgv.missionName : "暂未选择车辆"}</span>
                    </Form.Item>
                    <Row>
                        <Col span={12}>
                            <Form.Item label="起始点">
                                <span>{pathStartEnd.startCode}</span>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="到达点">
                                <span>{pathStartEnd.endCode}</span>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>
            <Card title="路径列表" className={styles.pathList}>
                <ActionOrderList
                    actionList={actionGroup}
                    ddlList={allDDL}
                    addVisible={false}
                    optVisible={false}
                    currentAction={currentAction}
                    currentAgv={currentAgv}
                />
            </Card>
        </div>
    );
};

export default connect(({ loading }: { loading: { effects: { [key: string]: boolean } } }) => ({}))(AgvRunning);
