/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout, {
  MenuDataItem,
  BasicLayoutProps as ProLayoutProps,
  Settings,
  DefaultFooter,
  SettingDrawer,
} from '@ant-design/pro-layout';
import React, { useEffect, useState } from 'react';
import { Link, useIntl, connect, Dispatch } from 'umi';
import { Result, Button } from 'antd';
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { ConnectState } from '@/models/connect';
import { getAuthorityFromRouter } from '@/utils/utils';
import logo from '../assets/img/logo2.png';
import style from './style.less';

const noMatch = (
  <Result
    status={403}
    title="403"
    subTitle="Sorry, you are not authorized to access this page."
    extra={
      <Button type="primary">
        <Link to="/user/login">Go Login</Link>
      </Button>
    }
  />
);
export interface BasicLayoutProps extends ProLayoutProps {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
  route: ProLayoutProps['route'] & {
    authority: string[];
  };
  settings: Settings;
  dispatch: Dispatch;
}
export type BasicLayoutContext = { [K in 'location']: BasicLayoutProps[K] } & {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
};
/**
 * use Authorized check all menu item
 */

const menuDataRender = (menuList: MenuDataItem[]): MenuDataItem[] =>
  menuList.map((item) => {
    const localItem = { ...item, children: item.children ? menuDataRender(item.children) : [] };
    return Authorized.check(item.authority, localItem, null) as MenuDataItem;
  });


const defaultFooterDom = (
  <DefaultFooter
    copyright="Wiiss Wcs Link 2.0"
    links={false}
  />
);


const BasicLayout: React.FC<BasicLayoutProps> = (props) => {
  const {
    dispatch,
    children,
    settings,
    location = {
      pathname: '/',
    },
  } = props;
  /**
   * constructor
   */
  const [footerHide,setFooterHide] = useState(false); 
  const [drawerFlag,setDrawerFlag] = useState(false);

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'user/fetchCurrent',
      });
    }
  }, []);
  /**
   * init variables
   */
  useEffect(() => {
    if(location.pathname?.indexOf('mapmonitor')!=-1 || location.pathname?.indexOf('home')!=-1 || location.pathname?.indexOf('devicemonitor')!=-1){
        setFooterHide(true)
    }else{
        setFooterHide(false)
    }
  }, [location]);

  const handleDrawerShow = (): void =>{
    setDrawerFlag(!drawerFlag)
  }

  const handleMenuCollapse = (payload: boolean): void => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  }; // get children authority

  const authorized = getAuthorityFromRouter(props.route.routes, location.pathname || '/') || {
    authority: undefined,
  };

  const handleCollapseChange = (collapse:boolean)=>{
    setDrawerFlag(collapse)
  }

  const { formatMessage } = useIntl();

  return (
    <>
    <ProLayout
      logo={logo}
      formatMessage={formatMessage}
      className={style.main}
      menuHeaderRender={(logoDom, titleDom) => (
        <Link to="/">
          {logoDom}
          {titleDom}
        </Link>
      )}
      onCollapse={handleMenuCollapse}
      // onCollapse={(...restArgs)=>{handleMenuCollapse(...restArgs)}}
      menuItemRender={(menuItemProps, defaultDom) => {
        if (menuItemProps.isUrl || menuItemProps.children || !menuItemProps.path) {
          return defaultDom;
        }

        return <Link to={menuItemProps.path}>{defaultDom}</Link>;
      }}
      breadcrumbRender={(routers = []) => [
        {
          path: '/',
          breadcrumbName: formatMessage({ id: 'menu.home' }),
        },
        ...routers,
      ]}
      itemRender={(route, params, routes, paths) => {
        const first = routes.indexOf(route) === 0;
        return first ? (
          <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
        ) : (
          <span>{route.breadcrumbName}</span>
        );
      }}
      footerRender={() => !footerHide?defaultFooterDom:''}
      menuDataRender={menuDataRender}
      rightContentRender={() => <RightContent handleShow={handleDrawerShow}/>}
      {...props}
      {...settings}
    >
      <Authorized authority={authorized!.authority} noMatch={noMatch}>
        {children}
      </Authorized>
      <SettingDrawer
          settings={settings}
          collapse={drawerFlag}
          onCollapseChange={handleCollapseChange}
          onSettingChange={(config) =>
            dispatch({
              type: 'settings/changeSetting',
              payload: config,
            })
          }
          hideHintAlert={true}
          hideCopyButton={true}
        />
    </ProLayout>
    </>    
  );
};

export default connect(({ global, settings }: ConnectState) => ({
  collapsed: global.collapsed,
  settings,
}))(BasicLayout);
