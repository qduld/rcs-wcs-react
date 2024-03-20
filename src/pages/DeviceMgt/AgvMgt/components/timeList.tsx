import React , { useEffect, useState , useRef } from 'react';
import { connect , Dispatch , useIntl } from 'umi';
import { Form , Button  , Row , Col  , notification , TimePicker  } from 'antd';

const { RangePicker } = TimePicker;

interface ModalProps {
    timeForm: any,
    data: Array<any>,    //是否可见
}

const timeList: React.FC<ModalProps> = (props) => {
    const { timeForm , data } = props
    let [timeListCache,setTimeListCache] = useState<Array<any>>([])
    const { formatMessage } = useIntl();

    useEffect(() => {
      timeForm.resetFields();
      setTimeListCache(data)
    }, []);

    const commonRule = {
        required: true,
        message: formatMessage({ id: 'global.common.required' })
    }

    const handleAdd = (index:number)=>{
        timeListCache.push({
          startTime:'',
          endTime:'',
        })
        setTimeListCache(timeListCache)
    }

    const handleRemove = (index:number)=>{
        timeListCache.splice(index,1)
        setTimeListCache(timeListCache)
    }

    const renderTimeList = ()=>{
        if(timeListCache.length>0){
            return timeListCache.map((item:any,index)=>{
              return (
                <Row>
                  <Form.Item name="startTime"
                  rules={[commonRule]}
                    >
                    <RangePicker value={item.startTime} picker={"time"}/>
                </Form.Item>
                {timeListCache.length!=1?
                  <Button onClick={()=>handleRemove(index)}>清除</Button>:
                  ''
                }
                <Button onClick={()=>handleAdd(index)}>新增</Button>
                </Row>
              )
            })
        }else{
           return <></>
        }
    }

    return (
        <Form form={timeForm}>
          {renderTimeList()}  
        </Form>
      );
    };

export default connect(({ loading }: { loading: { effects: { [key: string]: boolean } } }) => ({}))(timeList);
