import { Menu, Text } from "@mantine/core";
import { Avatar } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconSettings, IconSearch, IconPhoto, IconMessageCircle, IconTrash, IconArrowsLeftRight } from "@tabler/icons-react";
import { useSelector } from "react-redux";

const ProfileMenu = () => {
  const user = useSelector((state:any)=>state.user);
  const matches = useMediaQuery('(max-width:768px)');
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <div className="flex items-center gap-3 cursor-pointer">
          {!matches&&<span className="font-medium text-lg text-neutral-900">{user?.name || user?.username || "User"}</span>}
          <Avatar variant="filled" src="/avatar.png" size={45} alt="it's me" />
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