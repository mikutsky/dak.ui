import * as React from 'react';
import Box from "@mui/material/Box";

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import {TextField} from "@mui/material";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Spinner from "../components/Spinner/Spinner";
import {useEffect} from "react";

const Home = ({currentGiveaway, setCurrentPage, onSelectedGiveawayHandle, setGlobalLoading}) => {
    const [loading, setLoading] = React.useState(false);
    const [posts, setPosts] = React.useState([]);
    const [selectedPost, setSelectedPost] = React.useState(null);
    const [lastId, setLastId] = React.useState(null);
    const [config, setConfig] = React.useState({
        post_id: null,
        final_datetime: null,
        ticket_price: null,
        answer: null,
    });

    useEffect(() => {
        if (lastId === null) {
            setLoading(true);
            setLastId(0);
            fetchPosts(lastId);
        }
    }, [lastId, posts]);

    useEffect(() => {
        resetConfig();
    }, [currentGiveaway]);

    const resetConfig = () => {
        if (!currentGiveaway)
            setConfig({
                post_id: null,
                final_datetime: null,
                ticket_price: null,
                answer: null,
            });
        else
            setConfig({
                post_id: currentGiveaway.post_id,
                final_datetime: getDatetimeToISO(currentGiveaway.final_datetime),
                ticket_price: currentGiveaway.ticket_price,
                answer: currentGiveaway.answer,
            });
    };

    const isConfChanged = () => config.post_id !== currentGiveaway.post_id ||
        config.final_datetime !== getDatetimeToISO(currentGiveaway.final_datetime) ||
        config.ticket_price !== currentGiveaway.ticket_price ||
        config.answer !== currentGiveaway.answer;

    const updatePosts = (newPosts) => {
        const _post = posts.reduce((acc, post) => {
            const _newPost = newPosts.find(p => p.id === post.id);
            if (_newPost)
                Object.keys(_newPost).forEach(k => post[k] = _newPost[k])
            return [...acc, post]
        }, [])
        setPosts(_post)
    };

    const fetchPosts = (lastId) =>
        fetch(`${process.env.REACT_APP_API_URL}/posts${lastId?`?id=${lastId}`:''}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(response => {
                const lastId = response.lastId ?? -1
                const listPosts = response.posts ?? []
                setLastId(lastId);
                setPosts([...posts, ...listPosts]);
                setLoading(false);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });

    const saveSelectedHandle = () => {
        if (!selectedPost)
            return;
        setGlobalLoading(true);
        return fetch(`${process.env.REACT_APP_API_URL}/post?id=${selectedPost.id}`, {method: 'POST'})
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(() => {
                selectedPost['is_giveaway'] = true;
                selectedPost['status'] = (!selectedPost['status'] || selectedPost['status'] === 'created') ? 'created' : selectedPost['status'];
                onSelectedGiveawayHandle();
                setGlobalLoading(false);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }
    const deleteHandle = () => {
        if (!selectedPost)
            return;
        setGlobalLoading(true);
        return fetch(`${process.env.REACT_APP_API_URL}/delete/giveaway`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(selectedPost)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            }).then((response) => {
                if (response['post']) updatePosts([response['post']]);
                onSelectedGiveawayHandle();
                setGlobalLoading(false);
            }).catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }

    const getMoreHandle = () => {
        setLoading(true);
        fetchPosts(lastId);
    };

    const selectHandle = (post) => setSelectedPost(post);
    const getTitleName = (post) => `${post.date ?? 'Unknown date'}`;
    const getId = (post) => post?.id ?? null;
    const getPostAuthor = (post) => `${post.post_author ?? 'Unknown author'}`
    const getPostThumb = (post) => post.img_base64 ?? '';
    const getMessage = (post) => post.message ?? '';
    const getMoreVisible = () => lastId > 1;
    const saveDisabled = () => !selectedPost;
    const filteredPosts = () => posts.filter(p => !!getMessage(p))
    const isSelected = (post) => {
        return getId(post) === getId(selectedPost);
    }
    const isCreated = (post) => post && !!post['is_giveaway'];
    const isReady = (post) => post['status'] === 'ready';

    const isCurrentGiveaway = () => !!currentGiveaway;
    const getThumb = () => currentGiveaway?.post_img ?? '';
    const getName = () => currentGiveaway?.name ?? '';
    const getDescription = () => currentGiveaway?.description ?? '';
    const getAuthor = () => currentGiveaway['post_author'] ?? '';
    const getDatetimeToISO = (dateStr) => {
        return new Date(
            new Date(dateStr).getTime() - (new Date(Date.now()).getTimezoneOffset() * 60000)
        ).toISOString().slice(0, -8);
    }
    const getDatetime = () => {
        return currentGiveaway && currentGiveaway['post_date'] && getDatetimeToISO(currentGiveaway['post_date'])
    };
    const getDatetimeStart = () => currentGiveaway && currentGiveaway['start_datetime'] ?
        getDatetimeToISO(currentGiveaway['start_datetime']) : getDatetime();

    const configHandle = () => {
        if (!currentGiveaway) return;
        const body = {
            post_id: config.post_id,
            status: 'ready',
            final_datetime: config.final_datetime,
            ticket_price: config.ticket_price,
            answer: config.answer,
        };
        fetch(`${process.env.REACT_APP_API_URL}/config`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(() => {
                // resetConfig()
                onSelectedGiveawayHandle();
                setGlobalLoading(false);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    };

    return (
        <>
            <Box className="home">
                <Box className="configuration" padding="16px"
                     display={"flex"} flexDirection="row" justifyContent="center" gap={2}>
                    {isCurrentGiveaway() ? (
                        <>
                            <Card sx={{ maxWidth: 128 }}>
                                <CardActionArea>
                                    <CardMedia
                                        component="img"
                                        height="128"
                                        image={getThumb()}
                                        alt="green iguana"
                                    />
                                    <CardContent>
                                        <Typography gutterBottom variant="h7" component="div">
                                            {getName()}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                            <Card sx={{ width: '100%' }}>
                                <CardContent
                                    sx={{ minHeight: 128 }}
                                >
                                    <Box display={"flex"} direction="row" alignContent={'start'} paddingY={1} gap={1}>
                                        <TextField
                                            id="outlined-required"
                                            label="Author"
                                            defaultValue={getAuthor()}
                                            disabled={true}
                                        />
                                        <TextField
                                            id="outlined-required"
                                            label="Name"
                                            defaultValue={getName()}
                                            sx={{ maxWidth: '160', minWidth: '120' }}
                                            disabled={true}
                                        />
                                        <TextField
                                            fullWidth={true}
                                            id="outlined-required"
                                            label="Description"
                                            defaultValue={getDescription()}
                                            sx={{ minWidth: '120' }}
                                            disabled={true}
                                        />
                                    </Box>
                                    <Box display={"flex"} direction="row" alignContent={'start'} paddingY={1} gap={1}>
                                        {/*<TextField*/}
                                        {/*    id="outlined-required"*/}
                                        {/*    label="Time"*/}
                                        {/*    defaultValue={getDatetime()}*/}
                                        {/*    onBlur={(e)=>console.log('blur', e)}*/}
                                        {/*    type={"datetime-local"}*/}
                                        {/*    sx={{ minWidth: '80' }}*/}
                                        {/*    disabled={true}*/}
                                        {/*/>*/}
                                        <TextField
                                            fullWidth={true}
                                            id="outlined-required"
                                            label="Start season"
                                            defaultValue={getDatetimeStart()}
                                            type={"datetime-local"}
                                            disabled={true}
                                        />
                                        <TextField
                                            fullWidth={true}
                                            id="outlined-required"
                                            label="Finish season"
                                            // defaultValue={getDatetimeFinish()}
                                            type={"datetime-local"}
                                            value={config?.final_datetime ?? ''}
                                            onChange={({target}) => setConfig({...config, final_datetime: target.value})}
                                        />
                                    </Box>
                                    <Box display={"flex"} direction="row" alignContent={'start'} paddingY={1} gap={1}>
                                        <TextField
                                            id="outlined-required"
                                            label="Ticket price"
                                            // defaultValue={getPrice()}
                                            type={"number"}
                                            value={config?.ticket_price ?? ''}
                                            onChange={({target}) => setConfig({...config, ticket_price: Number(target.value)})}
                                        />
                                        <TextField
                                            fullWidth={true}
                                            id="outlined-required"
                                            label="Answer"
                                            sx={{ minWidth: '120' }}
                                            // defaultValue={getAnswer()}
                                            value={config?.answer ?? ''}
                                            onChange={({target}) => setConfig({...config, answer: target.value})}
                                        />
                                        <Button variant={"outlined"} onClick={resetConfig} disabled={!isConfChanged()}>Reset</Button>
                                        <Button variant={"contained"} onClick={configHandle} disabled={!isConfChanged()}>Save</Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <Card sx={{ width: '100%' }}>
                            <CardActionArea>
                                <CardContent
                                    sx={{ height: 128 }}
                                >
                                    <Box height='100%' alignContent='center'>
                                        <Typography gutterBottom variant="h8" component="div" color={"textSecondary"}>
                                            Select current giveaway
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    )}
                </Box>
                <Box className="telegram-control" display={"flex"} direction="row" padding="16px" alignContent='center' gap={1}>
                    <Button variant={"contained"} sx={{'width': '240px'}} onClick={saveSelectedHandle} disabled={saveDisabled()}>{selectedPost && isCreated(selectedPost) ? 'Choose' : 'Create giveaway'}</Button>
                    <Button variant={"outlined"} sx={{'width': '240px'}} onClick={deleteHandle} disabled={!isCreated(selectedPost)}>Delete giveaway</Button>
                </Box>
                <Box className="telegram-control" padding="16px" maxHeight={'calc(100vh - 420px)'} overflow={"scroll"}>
                    <List sx={{
                        width: '100%',
                        height: 'auto',
                        overflow: 'hidden'
                    }}>
                        {filteredPosts().map((post, index) => (
                            <React.Fragment key={index}>
                                <ListItem
                                    id={`telegram-list-item-${getId(post)}`}
                                    alignItems="flex-start"
                                    sx={{
                                        'backgroundColor': isSelected(post) ? '#1976d266' : isCreated(post) ? 'lemonchiffon' : isReady(post) ? 'bisque' : 'background.paper',
                                        'cursor': 'pointer'
                                    }}
                                    onClick={() => selectHandle(post)}
                                >
                                    <ListItemAvatar>
                                        <Avatar alt="Remy Sharp" src={getPostThumb(post)} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={getTitleName(post)}
                                        secondary={
                                            <React.Fragment>
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    sx={{ display: 'inline' }}
                                                >
                                                    {getPostAuthor(post).concat(' – ')}
                                                </Typography>
                                                {getMessage(post)}
                                            </React.Fragment>
                                        }
                                    />
                                </ListItem>
                                <Divider variant="inset" component="li" />
                            </React.Fragment>
                        ))}
                        {loading ? (
                            <ListItem alignItems="flex-start">
                                <ListItemAvatar>
                                    <Spinner size='37px'></Spinner>
                                </ListItemAvatar>
                            </ListItem>
                        ) : null}
                    </List>
                    {getMoreVisible() ? (
                        <Button variant="outlined" sx={{'width': '100%'}} onClick={getMoreHandle}>More</Button>
                    ) : null}
                </Box>
            </Box>
        </>
    )
}

export default Home;
