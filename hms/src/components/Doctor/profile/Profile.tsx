import { Avatar, Button, Divider, Modal, NumberInput, Select, Table, TextInput } from "@mantine/core"
import { DateInput } from '@mantine/dates';
import { IconEdit } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux"
import { doctorDepartments, doctorSpecializations } from "../../../data/DropDownData";
import { useDisclosure } from "@mantine/hooks";
import { getDoctor, updateDoctor } from "../../../service/DoctorProfileService";
import { useForm } from "@mantine/form";
import { formatDate } from "../../../utility/DateUtility";
import { errorNotification, successNotification } from "../../../utility/Notification";


// const doctor: any = {
//     name: "Dr. John Doe",
//     email: "dr.john.doe@example.com",
//     dob: "1985-07-20",
//     phone: "+91 9123456789",
//     address: "456, Oak Avenue, New Delhi, India",
//     licenseNo: "DL12345XYZ",
//     specialization: "Cardiology",
//     department: "Cardiology",
//     totalExp: 10, // years of experience
//     profilePicture: "https://randomuser.me/api/portraits/men/75.jpg",
// };


const Profile = () => {

    const user = useSelector((state: any) => state.user)
    const [editMode, setEdit] = useState(false);
    const [opened, { open, close }] = useDisclosure(false);
    
    const [profile, setProfile] = useState<any>({});
    useEffect(() => {
    if (user?.profileId) {
        getDoctor(user.profileId)
            .then((data) => {
                console.log("DOCTOR API RESPONSE:", data); // 🔥 IMPORTANT
                setProfile(data);
            })
            .catch((error) => {
                console.log("ERROR:", error);
            });
    }
}, [user?.profileId]);

    const form = useForm({
        initialValues: {
            dob: '',
            phoneNo: '',
            address: '',
            licenseNumber: '',
            specialization: '',
            department: '',
            totalExperience: 0,
        },

        validate: {
            dob: (value) => !value ? 'Date of Birth is required' : undefined,
            phoneNo: (value) => !value ? 'Phone number is required' : undefined,
            address: (value) => !value ? 'Address is required' : undefined,
            licenseNumber: (value) => !value ? 'licenseNumber number is required' : undefined,
        },

    })

    const handleEdit = () => {
        form.setValues({
            ...profile,
            dob: profile.dob ? new Date(profile.dob) : undefined,
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

        updateDoctor({
            ...profile,
            ...values,
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
                            <Table.Td className="font-semibold text-xl">License No</Table.Td>
                            {editMode ? (
                                <Table.Td className="text-xl">
                                    <NumberInput {...form.getInputProps("licenseNumber")} maxLength={12} clampBehavior="strict" placeholder="License No" />
                                </Table.Td>
                            ) : (
                                <Table.Td className="text-xl">{profile.licenseNumber ?? '-'}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className="font-semibold text-xl">Specialization</Table.Td>
                            {editMode ? (
                                <Table.Td className="text-xl">
                                    <Select {...form.getInputProps("specialization")} placeholder="Specialization" data={doctorSpecializations} />
                                </Table.Td>
                            ) : (
                                <Table.Td className="text-xl">{profile.specialization ?? '-'}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className="font-semibold text-xl">Department</Table.Td>
                            {editMode ? (
                                <Table.Td className="text-xl">
                                    <Select {...form.getInputProps("department")} placeholder="Department" data={doctorDepartments} />
                                </Table.Td>
                            ) : (
                                <Table.Td className="text-xl">{profile.department ?? '-'}</Table.Td>
                            )}
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td className="font-semibold text-xl">TotalExperience</Table.Td>
                            {editMode ? (
                                <Table.Td className="text-xl">
                                    <NumberInput {...form.getInputProps("totalExperience")} maxLength={2} max={50} clampBehavior="strict" placeholder="Total Experience" />
                                </Table.Td>
                            ) : (
                                <Table.Td className="text-xl">{profile.totalExperience ?? '-'}{profile.totalExperience?'years':''}</Table.Td>
                            )}
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </div>
            <Modal centered opened={opened} onClose={close} title={<span className="text-xl">Upload Profile Photo</span>}></Modal>
        </div >
    )
}
export default Profile