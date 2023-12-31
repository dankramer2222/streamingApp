import { isFollowingUser } from "@/lib/follow-service";
import { getUserByUsername } from "@/lib/user-service";
import { notFound } from "next/navigation";
import { Actions } from "./_components/actions";


interface UserPageProps {
  params: {
    username: string;
  };
}

const UserPage = async ({ params }: UserPageProps) => {
  try {
    const user = await getUserByUsername(params.username);

    if (!user) {
      return notFound();
    }

    const isFollowing = await isFollowingUser(user.id);

    return (
      <div className="flex flex-col gap-y-4">
        <p>username: {params.username}</p>
        <p>user Id: {user.id}</p>
        <p>is following: {`${isFollowing}`}</p>
        <Actions userId={user.id} isFollowing={isFollowing}/>
      </div>
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    return <p>Error fetching user</p>;
  }
};

export default UserPage;
