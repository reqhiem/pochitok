import Header from '@components/Header';

type CourseLayoutProps = {
    children: React.ReactNode;
};

const CourseLayout: React.FC<CourseLayoutProps> = ({
    children,
}: CourseLayoutProps) => {
    return (
        <>
            <Header />
            <main className="flex justify-center py-4 my-4">{children}</main>
        </>
    );
};

export default CourseLayout;