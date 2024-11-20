import * as React from 'react';
import Box from "@mui/material/Box";
import {useEffect, useState} from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CardMedia from "@mui/material/CardMedia";

const Telegram = ({currentGiveaway, setCurrentGiveaway, setGlobalLoading}) => {
    const [messages, setMessages] = useState([]);
    const [photos, setPhotos] = useState({});
    const [autoRecognize, setAutoRecognize] = useState(false);
    const [recognize, setRecognize] = useState(false);
    const [currentRecognizing, setCurrentRecognizing] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTick(prevTick => (prevTick < 3600 ? prevTick + 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!lastUpdate || new Date().getTime() - lastUpdate > currentGiveaway['interval']) {
            fetchMessages();
            setLastUpdate(new Date().getTime());
        }
    }, [tick]);

    useEffect(() => {
        const message = messages.find(({ media_filename }) => media_filename && !Object.keys(photos).includes(media_filename));
        if (message) {
            fetchPhoto(message['media_filename']);
        } else if (messages.length && Object.keys(photos) && !recognize && autoRecognize) setRecognize(true);
    }, [messages, photos]);

    useEffect(() => {
        if (recognize && Object.keys(photos).length) {
            const message = messages.find(({ media_filename, is_recognized, sender_id }) =>
                media_filename && Object.keys(photos).includes(media_filename) && !is_recognized && sender_id);
            if (message) {
                fetchRecognize(message)
            }
            setRecognize(false);
        }
    }, [recognize]);

    const updateMessage = (message) =>
        setMessages(messages.reduce((acc, m) => [...acc, m.id === message.id ? message : m], []));

    const fetchMessages = () => {
        setGlobalLoading(true);
        return fetch(`${process.env.REACT_APP_API_URL}/messages?giveawayid=${currentGiveaway.id}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then((response) => {
            if (response && response['messages'] && Array.isArray(response['messages']))
                setMessages(response['messages']);
            setGlobalLoading(false);
        }).catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    }

    const fetchPhoto = (filename) => {
        return fetch(`${process.env.REACT_APP_API_URL}/photo?filename=${filename}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then((response) => {
            if (response && response['photo'])
                setPhotos({...photos, [filename]: response['photo']});
        }).catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    };

    const fetchRecognize = (message) => {
        setCurrentRecognizing(message);
        return fetch(`${process.env.REACT_APP_API_URL}/recognize?id=${message['id']}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then((response) => {
            if (response && response['message'])
                updateMessage(response['message']);
                setCurrentRecognizing(null);
            if (response && response['giveaway'])
                setCurrentGiveaway(response['giveaway']);
        }).then(() => {
            setRecognize(autoRecognize);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    }

    const isAuthor = (message) => !!message['sender_id'];
    const getDateTime = (message) => {
        const options = {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        const date = new Date(message['date']);
        return new Intl.DateTimeFormat('en-GB', options).format(date);
    };

    const getPhoto = (message) => message['is_media'] ? (
        <CardMedia sx ={{
                width: 'auto',
                height: 'auto',
                maxWidth: '50%',
                maxHeight: '50%',
            }}
            component="img"
            image={Object.keys(photos).includes(message['media_filename']) ? photos[message['media_filename']] : process.env.PUBLIC_URL + '/assets/nophoto.jpg'}
            alt="Photo"
        />
    ) : null;

    const handleOnClick = (message) => fetchRecognize(message);
    const handleOnRun = () => {
        setAutoRecognize(true);
        setRecognize(true);
    }
    const handleOnStop = () => {
        setAutoRecognize(false);
        setRecognize(false);
    };

    return (
        <Box className="telegram" padding="16px" display="flex" flexDirection={"column"} gap={1}>
            <Box
                position="absolute"
                display="flex"
                sx={{
                    top: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    height: '48px',
                    alignItems: 'center'
                }}
                gap={1}
            >
                <Button size="small" variant={"contained"} disabled={autoRecognize} onClick={handleOnRun}>Run</Button>
                <Button size="small" variant={"contained"} disabled={!autoRecognize} onClick={handleOnStop}>Stop</Button>
                <Button size="small" variant={"outlined"}>Download EXCEL</Button>
            </Box>
            {messages.map((message, index) => (
                <Card key={index} sx={{
                    minWidth: 275,
                    margin: 0,
                    marginRight: isAuthor(message) ? '25%' : 0,
                    marginLeft: isAuthor(message) ? 0 : '25%',
                    // bgcolor: isAuthor(message) ? 'background.paper' : 'lemonchiffon',
                    borderColor: isAuthor(message) ? "darksalmon" : "deepskyblue",
                    borderWidth: "small",
                    borderRadius: isAuthor(message) ? "24px 24px 24px 4px" : "24px 24px 4px 24px",
                    borderStyle: "solid"
                }}>
                    <CardContent  sx={{ padding: 2 }}>
                        <Box sx={{
                                color: 'text.secondary',
                                fontSize: 14,
                                }}
                            display="flex"
                            flexDirection={isAuthor(message) ? "row" : "row-reverse"}
                            alignContent="space-between"
                        >
                            <Typography sx={{
                                color: isAuthor(message) ? 'darksalmon' : 'deepskyblue',
                                width: '100%',
                                textAlign: isAuthor(message) ? "left" : "right"
                            }}>[{getDateTime(message)}]: <b>{isAuthor(message) ? message['sender_id'] : 'DAK'}</b></Typography>
                            <Typography sx={{
                                color: isAuthor(message) ? 'darksalmon' : 'deepskyblue',
                                width: 'auto',
                                fontSize: 12,
                                textAlign: isAuthor(message) ? "left" : "right",
                            }}><i>{!!message['edit_date'] ? '(edited)' : null}</i></Typography>
                        </Box>
                        {getPhoto(message)}
                        {message['message'] ? (
                            <Typography variant="h5" component="div"
                                        sx={{
                                            textAlign: isAuthor(message) ? 'left' : 'right',
                                            marginTop: 2,
                                            marginBottom: 2
                                        }}>
                                {message['message']}
                            </Typography>
                        ) : null}
                        <Box sx={{
                            paddingTop: 2,
                            color: 'text.secondary',
                            fontSize: 14
                        }}
                             display="flex"
                             flexDirection={isAuthor(message) ? "row-reverse" : "row"}
                             alignContent="space-between"
                        >
                            {message['is_media'] && message['media_filename'] ? (
                                <Button size="small" variant={"contained"}
                                        disabled={message['is_recognized'] || currentRecognizing}
                                        sx={{
                                            width: 'auto',
                                            marginLeft: 1,
                                            marginRight: 1,
                                            textAlign: isAuthor(message) ? "left" : "right",
                                        }}
                                    onClick={() => handleOnClick(message)}
                                >
                                    {message['is_recognized'] ? 'Recognized' : 'Recognize'}
                                </Button>) : null}
                            {message['is_recognized'] ? (
                                <Button size="small" variant={"contained"}
                                        disabled={message['is_answered']}
                                        sx={{
                                            // color: isAuthor(message) ? 'darksalmon' : 'deepskyblue',
                                            width: 'auto',
                                            marginLeft: 1,
                                            marginRight: 1,
                                            textAlign: isAuthor(message) ? "left" : "right",
                                }}>{message['answer'] ? message['answer'] : ''}</Button>
                            ) : null}
                        </Box>
                    </CardContent>
                </Card>
            ))}
        </Box>
    )
}

export default Telegram;
