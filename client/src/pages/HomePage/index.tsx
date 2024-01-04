import GlobalLayout from '@layouts/GlobalLayout';

import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Spinner } from '@chakra-ui/react';

type IVideos = {
    occurrence: number;
    vid: string;
    source: string;
    thumbnail?: string;
    title: string;
    labels: string[];
};

const HomePage = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const { query } = useParams();
    const [videos, setVideos] = useState<IVideos[]>([]);
    useEffect(() => {
        const searchQuery = async () => {
            try {
                const res = await axios.get(`https://pochitok-server-xgfr5dzbga-uw.a.run.app/`);
                setVideos(res.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error searching videos:', error);
            }
        };
        searchQuery();
    }, [query]);
    return (
        <GlobalLayout>
            <div className="flex w-full justify-center max-w-screen-2xl">
                {loading ? (
                    <Spinner size="md" />
                ) : (
                    <div className="grid grid-cols-3 gap-10 justify-center">
                        {videos.map((video) => (
                            <div
                                key={video.vid}
                                className="bg-pt-black text-white w-96 rounded-t-3xl h-80 flex flex-col justify-between"
                            >
                                <div className="rounded-t-3xl flex justify-center w-full bg-black">
                                    <img
                                        src={
                                            video.thumbnail ||
                                            'https://via.placeholder.com/300'
                                        }
                                        alt=""
                                        className="object-contain h-52 mt- rounded-3xl"
                                    />
                                </div>
                                <div className="p-3 flex flex-col gap-2">
                                    <Link to={video.source} target="_blank">
                                        <h2 className="font-semibold text-lg">
                                            {video.title}
                                        </h2>
                                    </Link>
                                    <div className="flex justify-between">
                                        <div className="flex gap-1">
                                            {video.labels
                                                .slice(0, 3)
                                                .map((label, index) => (
                                                    <Link
                                                        key={index}
                                                        to={`/search/${label}`}
                                                    >
                                                        <span className="bg-[#CBFAFF] text-[#104D69] text-xs font-bold px-2 rounded-full py-1">
                                                            {label}
                                                        </span>
                                                    </Link>
                                                ))}
                                        </div>
                                        <div className="text-[#85909C] text-sm font-semibold">
                                            1 day ago
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </GlobalLayout>
    );
};

export default HomePage;
