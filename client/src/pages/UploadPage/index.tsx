import { useState } from 'react';
import { Button, Flex, FormControl, FormLabel, Input } from '@chakra-ui/react';
import GlobalLayout from '@layouts/GlobalLayout';
import DragDropFiles from '@components/DragDropFiles';
import Upload from '@assets/icons/upload.svg?react';

import './styles.css';
import axios from 'axios';

const UploadPage = () => {
    const [file, setFile] = useState<File | undefined>(undefined);
    const [videoTitle, setVideoTitle] = useState<string>('');
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const handleUploadFile = (file: File | undefined) => {
        setFile(file);
    };

    const handleSubmit = async () => {
        if (!file) {
            return;
        }
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file as Blob);
        formData.append('title', videoTitle);

        try {
            const res = await axios.post(
                'https://pochitok-server-xgfr5dzbga-uw.a.run.app/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );
            if (res.status === 200) {
                setIsUploading(false);
                console.log(res.data);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    return (
        <GlobalLayout>
            <Flex direction="column" justify="center" align="center" gap={5}>
                <p className={`text-4xl font-extrabold text-gradient`}>
                    Discover, Create & Share.
                </p>
                <DragDropFiles getInputFile={handleUploadFile} />
                <FormControl>
                    <FormLabel>
                        <p className="font-bold text-lg text-[#85909C]">
                            Video title
                        </p>
                    </FormLabel>
                    <Input
                        type="text"
                        onChange={(e) => {
                            setVideoTitle(e.target.value);
                        }}
                    />
                </FormControl>
                <Button
                    colorScheme="teal"
                    leftIcon={<Upload />}
                    borderRadius="full"
                    w="full"
                    onClick={handleSubmit}
                    isLoading={isUploading}
                >
                    Upload
                </Button>
            </Flex>
        </GlobalLayout>
    );
};

export default UploadPage;
