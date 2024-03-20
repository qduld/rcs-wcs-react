import React, { Component } from 'react';
import { connect } from 'umi';
import { Tabs } from 'antd';
import { MenuUnfoldOutlined , MenuFoldOutlined } from '@ant-design/icons';
const { TabPane } = Tabs;
import MapContext from '../context';
import { action } from './data.d'

import styles from './style.less';

import PointSite from './MapSideBar/PointSite'
import PathSite from './MapSideBar/PathSite'
// import Database from './MapSideBar/Database'

interface MapSideBarProps {
    actionList : Array<action>,
    collapse: Boolean ,
    handleCollapse : ()=>void 
}

class MapSideBar extends Component<MapSideBarProps> {
  siteWrapper:any

  constructor(props:any) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    let { actionList , collapse , handleCollapse } = this.props;
    return (
        <div className={!collapse?styles.mapSideBar:[styles.mapSideBar,styles.foldSideBar].join(' ')}>
            <Tabs defaultActiveKey="1" type="card">
                <TabPane tab="动作配置" key="1">
                    <MapContext.Consumer>{(value)=>
                        <PointSite
                            actionList = {actionList}
                            currentRegion = {value.currentRegion}
                            allDDL = {value.allDDL}
                            codeMapList = { value.codeMapList }
                            updateActionList={value.updateActionList}
                        />
                      }
                      </MapContext.Consumer>
                </TabPane>
                <TabPane tab="配置校验" key="2">
                  <MapContext.Consumer>{(value)=>
                    <PathSite
                        allDDL={value.allDDL}
                        updatePathList={value.updatePathList}
                        updateAgvList={value.updateAgvList}
                        updateCurrentAgv={value.updateCurrentAgv}
                        updateTrackFlag={value.updateTrackFlag}
                        codeMapList = { value.codeMapList }
                        currentRegion = { value.currentRegion}
                        monitorAgvList = {value.monitorAgvList}
                        updateMonitorAgvList={value.updateMonitorAgvList}
                      />
                    }
                  </MapContext.Consumer>
                </TabPane>
                {/* <TabPane tab="数据库" key="3">
                    <Database/>
                </TabPane> */}
            </Tabs>
                <MenuUnfoldOutlined
                    className={styles.sideBarUnfold}
                    onClick={handleCollapse}
                />
                {collapse?
                <MenuFoldOutlined
                    className={styles.sideBarFold}
                    onClick={handleCollapse}
                />
                :''
              }
        </div>
    );
  }
}; 

export default connect(
  ({
    loading,
  }: {
    loading: {
      effects: { [key: string]: boolean };
    };
  }) => ({
    loading: loading.effects['mapAndMonitor/fetchRcsMap'],
  }),
)(MapSideBar);

