import React, { useState, useRef } from 'react';
import { PiUploadSimple } from 'react-icons/pi';
import { Button, Icon, useToast } from '@chakra-ui/react';

import UploadWhite from '@assets/icons/upload-white.svg?react';

type DragDropFilesProps = {
    getInputFile: (file: File | undefined) => void;
};

const DragDropFiles = (props: DragDropFilesProps) => {
    const toast = useToast();
    const [inputFile, setInputFile] = useState<File | undefined>(undefined);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const file = event.dataTransfer.files[0];
        if (file.type.match(/mp4/)) {
            setInputFile(file);
            props.getInputFile(file);
        } else {
            toast({
                title: 'Tipo de archivo no permitido',
                description: 'Por favor, suba un archivo de tipo imagen o PDF.',
                status: 'error',
                variant: 'left-accent',
                duration: 2500,
                isClosable: true,
            });
        }
    };

    if (inputFile) {
        return (
            <div className="flex flex-row justify-start text-center items-center">
                <p className="font-bold tracking-wide text-ellipsis truncate">
                    {inputFile.name}
                </p>
                <div className="px-2">
                    <Button
                        onClick={() => setInputFile(undefined)}
                        colorScheme="red"
                    >
                        Cancelar
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            {!inputFile && (
                <div
                    className="flex flex-col w-96 bg-[#1D2A34] items-center justify-center p-2 border-dashed border-2 border-gray-500 text-center rounded-lg"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <Icon
                        as={PiUploadSimple}
                        boxSize={12}
                        p={2}
                        color="green.400"
                    />
                    <h1 className="tracking-wide">Drag and drop Here</h1>
                    <h1 className="tracking-wide">--or--</h1>
                    <input
                        type="file"
                        accept="mp4"
                        onChange={(
                            event: React.ChangeEvent<HTMLInputElement>,
                        ) => {
                            setInputFile(event?.target?.files?.[0]);
                            props.getInputFile(event?.target?.files?.[0]);
                        }}
                        hidden
                        ref={fileRef}
                    />
                    <div className="pb-2">
                        <Button
                            borderRadius="full"
                            bg="#28313A"
                            color="white"
                            onClick={() => fileRef?.current?.click()}
                            leftIcon={<UploadWhite />}
                        >
                            Select a video
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};

export default DragDropFiles;
