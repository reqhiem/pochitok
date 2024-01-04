import { useState } from "react";
import { Button, Input } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";

import Upload from "@assets/icons/upload.svg?react";
import Search from "@assets/icons/search.svg?react";

const Header = () => {
    const [query, setQuery] = useState<string>("");
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 backdrop-blur-md flex justify-center py-4">
            <div className="flex items-center w-full justify-between max-w-screen-2xl">
                <Link to="/">
                    <h1 className="font-black text-3xl">PochiTok</h1>
                </Link>
                <div className="flex gap-4">
                    <Input
                        type="text"
                        placeholder="Search"
                        borderRadius="full"
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && query.length > 0) {
                                navigate(`/search/${query}`);
                            }
                        }}
                    />
                    <Button leftIcon={<Search />} px={8} borderRadius="full" onClick={(e) => {
                        e.preventDefault();
                        if (query.length > 0) navigate(`/search/${query}`);
                    }}>Search</Button>
                </div>

                <Link to="/upload">
                    <Button colorScheme="teal" leftIcon={<Upload />} px={8} borderRadius="full">Upload a Pochi</Button>
                </Link>
            </div>
        </header>
    );
};

export default Header;
