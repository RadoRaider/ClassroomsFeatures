import React, { useState, useEffect } from 'react';
import { Button, List, Card, Modal, Form, message, Input } from 'antd';
import {
  createDay,
  deleteDay,
  getDayToolboxAll,
  getDayToolbox,
  updateDayDetails,
  getLearningStandardDays,
} from '../../../Utils/requests';
import './DayEditor.less';

const DayEditor = ({
  learningStandard,
  history,
  viewing,
  setViewing,
  page,
  tab,
}) => {
  const [visible, setVisible] = useState(false);
  const [dayDetailsVisible, setDayDetailsVisible] = useState(false);
  const [days, setDay] = useState([]);
  const [selectDay, setSelectDay] = useState('');
  const [description, setDescription] = useState('');
  const [TekS, setTekS] = useState('');
  const [scienceObj, setScienceObj] = useState('');
  const [makingObj, setMakingObj] = useState('');
  const [computationObj, setComputationObj] = useState('');

  const showDayDetailsModal = async (dayObj) => {
    setDayDetailsVisible(true);
    setSelectDay(dayObj);
    setDescription(dayObj.description);
    setTekS(dayObj.TekS);
    const learningComponents = dayObj.objectives;
    setScienceObj(
      learningComponents[0] ? learningComponents[0].description : ''
    );
    setMakingObj(
      learningComponents[1] ? learningComponents[1].description : ''
    );
    setComputationObj(
      learningComponents[2] ? learningComponents[2].description : ''
    );
    console.log(dayObj);
  };

  useEffect(() => {
    const getDay = async () => {
      if (viewing && viewing === learningStandard.id) {
        const getDayAll = await getLearningStandardDays(viewing);
        const myDays = getDayAll.data;
        myDays.sort((a, b) => (a.number > b.number ? 1 : -1));
        setDay([...myDays]);
        setVisible(true);
      }
    };
    getDay();
  }, [viewing, learningStandard.id]);

  const addBasicDay = async () => {
    let newDay = 1;
    if (days.length !== 0) {
      newDay = parseInt(days[days.length - 1].number) + 1;
    }

    const response = await createDay(newDay, learningStandard.id);
    if (response.err) {
      message.error(response.err);
    }
    setDay([...days, response.data]);
    console.log(response);
  };

  const removeBasicDay = async (currDay) => {
    if (window.confirm(`Deleting Day ${currDay.number}`)) {
      const response = await deleteDay(currDay.id);
      if (response.err) {
        message.error(response.err);
      }

      const getDayAll = await getLearningStandardDays(learningStandard.id);
      if (getDayAll.err) {
        message.error(getDayAll.err);
      }
      setDay([...getDayAll.data]);
    }
  };

  const handleViewDay = async (day) => {
    const allToolBoxRes = await getDayToolboxAll();
    const selectedToolBoxRes = await getDayToolbox(day.id);
    day.selectedToolbox = selectedToolBoxRes.data.toolbox;
    day.toolbox = allToolBoxRes.data.toolbox;

    day.learning_standard_name = learningStandard.name;
    localStorage.setItem('my-day', JSON.stringify(day));
    history.push('/day');
  };

  const onClickDayDetailsHandler = async (e) => {
    e.preventDefault();
    const res = await updateDayDetails(
      selectDay.id,
      description,
      TekS,
      scienceObj,
      makingObj,
      computationObj
    );
    if (res.err) {
      message.error(res.err);
    } else {
      setDayDetailsVisible(false);
      handleViewDay(selectDay);
    }
  };

  return (
    <div>
      <Modal
        title={learningStandard.name}
        visible={visible}
        onCancel={() => {
          setVisible(false);
          setViewing(undefined);
          history.push(`#${tab}#${page}`);
        }}
        onOk={() => {
          setVisible(false);
          setViewing(undefined);
          history.push(`#${tab}#${page}`);
        }}
        size='large'
      >
        <div className='list-position'>
          {days.length > 0 ? (
            <List
              grid={{ gutter: 16, column: 3 }}
              dataSource={days}
              renderItem={(item) => (
                <List.Item>
                  <Card
                    id='card-day'
                    key={item.id}
                    title={'Day ' + item.number}
                    hoverable='true'
                    onClick={() => showDayDetailsModal(item)}
                  />
                  <span
                    className='delete-btn'
                    onClick={() => removeBasicDay(item)}
                  >
                    &times;
                  </span>
                </List.Item>
              )}
            />
          ) : null}
          <div>
            <Form
              id='add-day'
              wrapperCol={{
                span: 14,
              }}
              layout='horizontal'
              size='default'
            >
              <Button onClick={addBasicDay} type='primary'>
                Add Day
              </Button>
            </Form>
          </div>
        </div>
      </Modal>

      <Modal
        title='Selected Day Details Editor'
        visible={dayDetailsVisible}
        onCancel={() => setDayDetailsVisible(false)}
        onOk={onClickDayDetailsHandler}
        width='35vw'
      >
        <Form id='add-day-details' layout='horizontal' size='default'>
          <Form.Item id='form-label' label='Description'>
            <Input.TextArea
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              placeholder='Enter description'
            ></Input.TextArea>
          </Form.Item>
          <Form.Item id='form-label' label='TekS'>
            <Input
              onChange={(e) => setTekS(e.target.value)}
              value={TekS}
              placeholder='Enter tekS'
            ></Input>
          </Form.Item>

          <h3>Lesson Learning Components</h3>
          <Form.Item id='form-label' label='Science Component'>
            <Input.TextArea
              onChange={(e) => setScienceObj(e.target.value)}
              value={scienceObj}
              placeholder='Enter science component'
            ></Input.TextArea>
          </Form.Item>
          <Form.Item id='form-label' label='Maker Component'>
            <Input.TextArea
              onChange={(e) => setMakingObj(e.target.value)}
              value={makingObj}
              placeholder='Enter maker component'
            ></Input.TextArea>
          </Form.Item>
          <Form.Item id='form-label' label='Computer Science Component'>
            <Input.TextArea
              onChange={(e) => setComputationObj(e.target.value)}
              value={computationObj}
              placeholder='Enter computer science component'
            ></Input.TextArea>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DayEditor;
