import { Avatar, Button, Divider, Modal, NumberInput, Select, Table, TagsInput, TextInput } from "@mantine/core"
import { DateInput } from '@mantine/dates';
import { IconEdit } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux"
import { bloodGroups } from "../../../data/DropDownData";
import { useDisclosure } from "@mantine/hooks";
import { getPatient, updatePatient } from "../../../service/PatientProfileService";
import { formatDate } from "../../../utility/DateUtility";
import { useForm } from "@mantine/form";
import { errorNotification, successNotification } from "../../../utility/Notification";
import { arrayToCSV } from "../../../utility/OtherUtility";
import DropzoneButton from "../../utility/dropzones/DropzoneButton";

// const patient: any = {
//     name: "Avinash Surwase",
//     email: "surwaseavinash85@gmail.com",
//     dob: "2005-08-15",
//     phone: "+91 9876543210",
//     address: "Beed Maharashtra",
//     aadharNo: "1234-5678-9012",
//     bloodGroup: "O+",
//     allergies: "Peanuts",
//     chronicDisease: "Diabetes",
//     profilePicture: "https://randomuser.me/api/portraits/men/75.jpg",
// };


const Profile = () => {

    const user = useSelector((state: any) => state.user)
    const [editMode, setEdit] = useState(false);
    const [opened, { open, close }] = useDisclosure(false);
    const [profile, setProfile] = useState<any>({});
    useEffect(() => {
    if (user?.profileId) {
        console.log("CALL API:", user.profileId);

        getPatient(user.profileId)
            .then((data) => {
                setProfile({
                    ...data,
                    allergies: data.allergies ? JSON.parse(data.allergies) : [],
                    chronicDisease: data.chronicDisease ? JSON.parse(data.chronicDisease) : []
                });
            })
            .catch((error) => {
                console.log("ERROR:", error);
            });
    }
}, [user?.profileId]); // 🔥 dependency add

    const form = useForm({
        initialValues: {
            dob: '',
            phoneNo: '',
            address: '',
            aadharId: '',
            bloodGroup: '',
            allergies: [],
            chronicDisease: [],
        },

        validate: {
            dob: (value) => !value ? 'Date of Birth is required' : undefined,
            phoneNo: (value) => !value ? 'Phone number is required' : undefined,
            address: (value) => !value ? 'Address is required' : undefined,
            aadharId: (value) => !value ? 'Aadhar number is required' : undefined,
        },

    })

    const handleEdit = () => {
        form.setValues({
            ...profile,
            dob: profile.dob ? new Date(profile.dob) : undefined,
            chronicDisease: profile.chronicDisease ?? [],
            allergies: profile.allergies ?? []
        });
        setEdit(true);
    }

    const handleSubmit = () => {
        const result = form.validate();

        if (result.hasErrors) {
            const firstError = Object.values(result.errors)[0];
            errorNotification(firstError as string); // 🔥 popup show
            return;
        }

        const values = form.getValues();

        updatePatient({
            ...profile,
            ...values,
            allergies: values.allergies ? JSON.stringify(values.allergies) : null,
            chronicDisease: values.chronicDisease ? JSON.stringify(values.chronicDisease) : null
        })
            .then(() => {
                successNotification("Profile Updated Successfully");
                setProfile({ ...profile, ...values });
                setEdit(false);
            })
            .catch((error) => {
                errorNotification(error?.response?.data?.errorMessage || "Something went wrong");
            });
    };
    return (
        <div className="p-10">
            <div className="flex justify-between items-center">
                <div className="flex gap-5 items-center">
                    <div className="flex flex-col items-center gap-3">
                        <Avatar variant="filled" src="/avatar.png" size="xl" alt="it's me" />
                        {editMode && <Button size="sm" onClick={open} variant="filled">Upload</Button>}
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="text-3xl font-medium text-neutral-900">{user.name}</div>
                        <div className="text-xl text-neutral-700">{user.email}</div>
                    </div>
                </div>
                {!editMode ? (<Button size="lg" onClick={handleEdit} variant="filled" leftSection={<IconEdit />}>Edit</Button>
                ) : (<Button onClick={handleSubmit} size="lg" type="submit" variant="filled">Submit</Button>
                )}
            </div>
            <Divider my="xl"></Divider>
            <div>
                <div className="text-2xl font-medium mb-5 text-neutral-900">Personal Information</div>
                <Table striped stripedColor="primary.1" verticalSpacing="md" withRowBorders={false}>
                    <Table.Tbody className="[&>tr]:!mb-3 [&_td]:!w-1/">
                        <Table.Tr>
                            <Table.Td className="font-semibold text-xl">Date of Birth</Table.Td>
                            {editMode ? (
                                <Table.Td className="text-xl">
                                    <DateInput
                                        {...form.getInputProps("dob")}
                                        placeholder="Date of Birth"
                                    />
                                </Table.Td>
                            ) : (
                                <Table.Td className="text-xl">{formatDate(profile.dob) ?? '-'}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className="font-semibold text-xl">Phone</Table.Td>
                            {editMode ? (
                                <Table.Td className="text-xl">
                                    <NumberInput {...form.getInputProps("phoneNo")} maxLength={10} clampBehavior="strict" placeholder="Phone number" />
                                </Table.Td>
                            ) : (
                                <Table.Td className="text-xl">{profile.phoneNo ?? '-'}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className="font-semibold text-xl">Address</Table.Td>
                            {editMode ? (
                                <Table.Td className="text-xl">
                                    <TextInput {...form.getInputProps("address")} placeholder="Address" />
                                </Table.Td>
                            ) : (
                                <Table.Td className="text-xl">{profile.address ?? '-'}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className="font-semibold text-xl">Aadhar No</Table.Td>
                            {editMode ? (
                                <Table.Td className="text-xl">
                                    <NumberInput {...form.getInputProps("aadharId")} maxLength={12} clampBehavior="strict" placeholder="Aadhar Number" />
                                </Table.Td>
                            ) : (
                                <Table.Td className="text-xl">{profile.aadharId ?? '-'}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className="font-semibold text-xl">Blood Group</Table.Td>
                            {editMode ? (
                                <Table.Td className="text-xl">
                                    <Select {...form.getInputProps("bloodGroup")} placeholder="Blood group" data={bloodGroups} />
                                </Table.Td>
                            ) : (
                                <Table.Td className="text-xl">{profile.bloodGroup ?? '-'}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className="font-semibold text-xl">Allergies</Table.Td>
                            {editMode ? (
                                <Table.Td className="text-xl">
                                    <TagsInput {...form.getInputProps("allergies")} placeholder="Allergies seprated by comma" />
                                </Table.Td>
                            ) : (
                                <Table.Td className="text-xl">{arrayToCSV(profile.allergies) ?? '-'}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className="font-semibold text-xl">Chronic Disease</Table.Td>
                            {editMode ? (
                                <Table.Td className="text-xl">
                                    <TagsInput {...form.getInputProps("chronicDisease")} placeholder="Chronic Disease seprated by comma" />
                                </Table.Td>
                            ) : (
                                <Table.Td className="text-xl">{arrayToCSV(profile.chronicDisease) ?? '-'}</Table.Td>
                            )}
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </div>
            <Modal centered opened={opened} onClose={close} title={<span className="text-xl">Upload Profile Photo</span>}>
            <DropzoneButton/>
            </Modal>
        </div >
    )
}
export default Profile