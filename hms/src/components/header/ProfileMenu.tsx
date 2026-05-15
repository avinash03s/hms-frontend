import { Menu, Text, Avatar } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconSettings, IconSearch, IconPhoto, IconMessageCircle, IconTrash, IconArrowsLeftRight } from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getDoctor } from "../../service/DoctorProfileService";
import { getPatient } from "../../service/PatientProfileService";

const ProfileMenu = () => {
  const user = useSelector((state: any) => state.user);
  const matches = useMediaQuery('(max-width:768px)');
  const [profilePictureId, setProfilePictureId] = useState<any>(null);

  useEffect(() => {
    if (!user?.profileId) return;
    const loadProfile = async () => {
      try {
        let data;
        if (user.role === "DOCTOR") {
          data = await getDoctor(user.profileId);
        } else {
          data = await getPatient(user.profileId);
        }
        setProfilePictureId(data?.profilePictureId);
      } catch (error) {
        console.log(error);
      }
    };
    loadProfile();
  }, [user]);

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <div className="flex items-center gap-3 cursor-pointer">
          {!matches &&
            <span className="font-medium text-lg text-neutral-900">
              {user?.name || user?.username || "User"}
            </span>
          }
          <Avatar
            variant="filled"
            src={
              profilePictureId
                ? `http://localhost:9000/profile/files/${profilePictureId}`
                : "/avatar.png"
            }
            size={45}
            alt="it's me"
          />
        </div>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Application</Menu.Label>
        <Menu.Item leftSection={<IconSettings size={16} />}>
          Settings
        </Menu.Item>
        <Menu.Item leftSection={<IconMessageCircle size={16} />}>
          Messages
        </Menu.Item>
        <Menu.Item leftSection={<IconPhoto size={16} />}>
          Gallery
        </Menu.Item>
        <Menu.Item
          leftSection={<IconSearch size={16} />}
          rightSection={
            <Text size="xs" c="dimmed">
              ⌘K
            </Text>
          }
        >
          Search
        </Menu.Item>
        <Menu.Divider />
        <Menu.Label>Danger zone</Menu.Label>
        <Menu.Item leftSection={<IconArrowsLeftRight size={16} />}>
          Transfer my data
        </Menu.Item>
        <Menu.Item color="red" leftSection={<IconTrash size={16} />}>
          Delete my account
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default ProfileMenu;