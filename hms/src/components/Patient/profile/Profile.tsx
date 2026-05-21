import {
    Avatar,
    Button,
    Divider,
    Modal,
    NumberInput,
    Select,
    Table,
    TagsInput,
    TextInput
} from "@mantine/core";

import { DateInput } from '@mantine/dates';
import { IconEdit } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { bloodGroups } from "../../../data/DropDownData";
import { useDisclosure } from "@mantine/hooks";

import {
    getPatient,
    updatePatient,
    uploadProfilePhoto
} from "../../../service/PatientProfileService";

import { formatDate } from "../../../utility/DateUtility";

import { useForm } from "@mantine/form";

import {
    errorNotification,
    successNotification
} from "../../../utility/Notification";

import { arrayToCSV } from "../../../utility/OtherUtility";

const Profile = () => {

    const user = useSelector((state: any) => state.user);

    const [editMode, setEdit] = useState(false);

    const [opened, { open, close }] = useDisclosure(false);

    const [profile, setProfile] = useState<any>({});

    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {

        if (user?.profileId) {

            console.log("CALL API:", user.profileId);

            getPatient(user.profileId)
                .then((data) => {

                    setProfile({
                        ...data,

                        allergies: data.allergies
                            ? JSON.parse(data.allergies)
                            : [],

                        chronicDisease: data.chronicDisease
                            ? JSON.parse(data.chronicDisease)
                            : []
                    });

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
            aadharId: '',
            bloodGroup: '',
            allergies: [],
            chronicDisease: [],
        },

        validate: {

            dob: (value) =>
                !value
                    ? 'Date of Birth is required'
                    : undefined,

            phoneNo: (value) =>
                !value
                    ? 'Phone number is required'
                    : undefined,

            address: (value) =>
                !value
                    ? 'Address is required'
                    : undefined,

            aadharId: (value) =>
                !value
                    ? 'Aadhar number is required'
                    : undefined,

        },

    });

    const handleEdit = () => {

        form.setValues({
            ...profile,

            dob: profile.dob
                ? new Date(profile.dob)
                : undefined,

            chronicDisease: profile.chronicDisease ?? [],

            allergies: profile.allergies ?? []
        });

        setEdit(true);
    };

    const handlePhotoUpload = async () => {

        if (!file) {
            errorNotification("Please select PNG image");
            return;
        }

        if (file.type !== "image/png") {
            errorNotification("Only PNG image allowed");
            return;
        }

        try {

            const response = await uploadProfilePhoto(
                file,
                profile?.profilePictureId
            );

            const updatedProfile = {

                ...profile,

                profilePictureId: response.id,

                allergies: profile.allergies
                    ? JSON.stringify(profile.allergies)
                    : null,

                chronicDisease: profile.chronicDisease
                    ? JSON.stringify(profile.chronicDisease)
                    : null,
            };

            await updatePatient(updatedProfile);

            setProfile({
                ...profile,
                profilePictureId: response.id
            });

            successNotification("Photo Uploaded");

            setFile(null);

            close();

        } catch (error: any) {

            errorNotification(
                error?.response?.data?.errorMessage || "Upload failed"
            );
        }
    };

    const handleSubmit = () => {

        const result = form.validate();

        if (result.hasErrors) {

            const firstError = Object.values(result.errors)[0];

            errorNotification(firstError as string);

            return;
        }

        const values = form.getValues();

        updatePatient({

            ...profile,

            ...values,

            allergies: values.allergies
                ? JSON.stringify(values.allergies)
                : null,

            chronicDisease: values.chronicDisease
                ? JSON.stringify(values.chronicDisease)
                : null

        })
            .then(() => {

                successNotification("Profile Updated Successfully");

                setProfile({
                    ...profile,
                    ...values
                });

                setEdit(false);

            })
            .catch((error) => {

                errorNotification(
                    error?.response?.data?.errorMessage ||
                    "Something went wrong"
                );

            });
    };

    return (

        <div className="p-4 sm:p-6 lg:p-10">

            {/* HEADER */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">

                {/* LEFT */}
                <div className="flex flex-col sm:flex-row gap-5 sm:items-center">

                    {/* AVATAR */}
                    <div className="flex flex-col items-center gap-3 shrink-0">

                        <Avatar
                            variant="filled"
                            src={
                                profile?.profilePictureId
                                    ? `http://localhost:9000/profile/files/${profile.profilePictureId}`
                                    : "/avatar.png"
                            }
                            size={110}
                            alt="profile"
                        />

                        {editMode && (

                            <Button
                                size="sm"
                                onClick={open}
                                variant="filled"
                                className="w-full sm:w-auto"
                            >
                                Upload
                            </Button>
                        )}
                    </div>

                    {/* USER INFO */}
                    <div className="flex flex-col gap-2 break-all">

                        <div className="text-2xl sm:text-3xl font-semibold text-neutral-900">
                            {user.name}
                        </div>

                        <div className="text-base sm:text-xl text-neutral-700 break-all">
                            {user.email}
                        </div>
                    </div>
                </div>

                {/* BUTTON */}
                <div className="w-full sm:w-auto">

                    {!editMode ? (

                        <Button
                            fullWidth
                            size="lg"
                            onClick={handleEdit}
                            variant="filled"
                            leftSection={<IconEdit size={18} />}
                        >
                            Edit
                        </Button>

                    ) : (

                        <Button
                            fullWidth
                            onClick={handleSubmit}
                            size="lg"
                            type="submit"
                            variant="filled"
                        >
                            Submit
                        </Button>
                    )}
                </div>
            </div>

            <Divider my="xl" />

            {/* PERSONAL INFO */}
            <div>

                <div className="text-xl sm:text-2xl font-semibold mb-5 text-neutral-900">
                    Personal Information
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden md:block overflow-x-auto">

                    <Table
                        striped
                        stripedColor="primary.1"
                        verticalSpacing="md"
                        withRowBorders={false}
                    >

                        <Table.Tbody>

                            {/* DOB */}
                            <Table.Tr>

                                <Table.Td className="font-semibold text-lg lg:text-xl w-[35%]">
                                    Date of Birth
                                </Table.Td>

                                {editMode ? (

                                    <Table.Td>

                                        <DateInput
                                            {...form.getInputProps("dob")}
                                            placeholder="Date of Birth"
                                        />

                                    </Table.Td>

                                ) : (

                                    <Table.Td className="text-base lg:text-xl">
                                        {formatDate(profile.dob) ?? '-'}
                                    </Table.Td>
                                )}
                            </Table.Tr>

                            {/* PHONE */}
                            <Table.Tr>

                                <Table.Td className="font-semibold text-lg lg:text-xl">
                                    Phone
                                </Table.Td>

                                {editMode ? (

                                    <Table.Td>

                                        <NumberInput
                                            {...form.getInputProps("phoneNo")}
                                            maxLength={10}
                                            clampBehavior="strict"
                                            placeholder="Phone number"
                                        />

                                    </Table.Td>

                                ) : (

                                    <Table.Td className="text-base lg:text-xl">
                                        {profile.phoneNo ?? '-'}
                                    </Table.Td>
                                )}
                            </Table.Tr>

                            {/* ADDRESS */}
                            <Table.Tr>

                                <Table.Td className="font-semibold text-lg lg:text-xl">
                                    Address
                                </Table.Td>

                                {editMode ? (

                                    <Table.Td>

                                        <TextInput
                                            {...form.getInputProps("address")}
                                            placeholder="Address"
                                        />

                                    </Table.Td>

                                ) : (

                                    <Table.Td className="text-base lg:text-xl break-words">
                                        {profile.address ?? '-'}
                                    </Table.Td>
                                )}
                            </Table.Tr>

                            {/* AADHAR */}
                            <Table.Tr>

                                <Table.Td className="font-semibold text-lg lg:text-xl">
                                    Aadhar No
                                </Table.Td>

                                {editMode ? (

                                    <Table.Td>

                                        <NumberInput
                                            {...form.getInputProps("aadharId")}
                                            maxLength={12}
                                            clampBehavior="strict"
                                            placeholder="Aadhar Number"
                                        />

                                    </Table.Td>

                                ) : (

                                    <Table.Td className="text-base lg:text-xl">
                                        {profile.aadharId ?? '-'}
                                    </Table.Td>
                                )}
                            </Table.Tr>

                            {/* BLOOD GROUP */}
                            <Table.Tr>

                                <Table.Td className="font-semibold text-lg lg:text-xl">
                                    Blood Group
                                </Table.Td>

                                {editMode ? (

                                    <Table.Td>

                                        <Select
                                            {...form.getInputProps("bloodGroup")}
                                            placeholder="Blood group"
                                            data={bloodGroups}
                                        />

                                    </Table.Td>

                                ) : (

                                    <Table.Td className="text-base lg:text-xl">
                                        {profile.bloodGroup ?? '-'}
                                    </Table.Td>
                                )}
                            </Table.Tr>

                            {/* ALLERGIES */}
                            <Table.Tr>

                                <Table.Td className="font-semibold text-lg lg:text-xl">
                                    Allergies
                                </Table.Td>

                                {editMode ? (

                                    <Table.Td>

                                        <TagsInput
                                            {...form.getInputProps("allergies")}
                                            placeholder="Allergies separated by comma"
                                        />

                                    </Table.Td>

                                ) : (

                                    <Table.Td className="text-base lg:text-xl break-words">
                                        {arrayToCSV(profile.allergies) ?? '-'}
                                    </Table.Td>
                                )}
                            </Table.Tr>

                            {/* CHRONIC */}
                            <Table.Tr>

                                <Table.Td className="font-semibold text-lg lg:text-xl">
                                    Chronic Disease
                                </Table.Td>

                                {editMode ? (

                                    <Table.Td>

                                        <TagsInput
                                            {...form.getInputProps("chronicDisease")}
                                            placeholder="Chronic Disease separated by comma"
                                        />

                                    </Table.Td>

                                ) : (

                                    <Table.Td className="text-base lg:text-xl break-words">
                                        {arrayToCSV(profile.chronicDisease) ?? '-'}
                                    </Table.Td>
                                )}
                            </Table.Tr>

                        </Table.Tbody>
                    </Table>
                </div>

                {/* MOBILE CARD VIEW */}
                <div className="flex flex-col gap-4 md:hidden">

                    {/* DOB */}
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="font-semibold text-base mb-2">
                            Date of Birth
                        </div>

                        {editMode ? (
                            <DateInput
                                {...form.getInputProps("dob")}
                                placeholder="Date of Birth"
                            />
                        ) : (
                            <div className="text-neutral-700">
                                {formatDate(profile.dob) ?? '-'}
                            </div>
                        )}
                    </div>

                    {/* PHONE */}
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="font-semibold text-base mb-2">
                            Phone
                        </div>

                        {editMode ? (
                            <NumberInput
                                {...form.getInputProps("phoneNo")}
                                maxLength={10}
                                clampBehavior="strict"
                                placeholder="Phone number"
                            />
                        ) : (
                            <div className="text-neutral-700">
                                {profile.phoneNo ?? '-'}
                            </div>
                        )}
                    </div>

                    {/* ADDRESS */}
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="font-semibold text-base mb-2">
                            Address
                        </div>

                        {editMode ? (
                            <TextInput
                                {...form.getInputProps("address")}
                                placeholder="Address"
                            />
                        ) : (
                            <div className="text-neutral-700 break-words">
                                {profile.address ?? '-'}
                            </div>
                        )}
                    </div>

                    {/* AADHAR */}
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="font-semibold text-base mb-2">
                            Aadhar No
                        </div>

                        {editMode ? (
                            <NumberInput
                                {...form.getInputProps("aadharId")}
                                maxLength={12}
                                clampBehavior="strict"
                                placeholder="Aadhar Number"
                            />
                        ) : (
                            <div className="text-neutral-700">
                                {profile.aadharId ?? '-'}
                            </div>
                        )}
                    </div>

                    {/* BLOOD GROUP */}
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="font-semibold text-base mb-2">
                            Blood Group
                        </div>

                        {editMode ? (
                            <Select
                                {...form.getInputProps("bloodGroup")}
                                placeholder="Blood group"
                                data={bloodGroups}
                            />
                        ) : (
                            <div className="text-neutral-700">
                                {profile.bloodGroup ?? '-'}
                            </div>
                        )}
                    </div>

                    {/* ALLERGIES */}
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="font-semibold text-base mb-2">
                            Allergies
                        </div>

                        {editMode ? (
                            <TagsInput
                                {...form.getInputProps("allergies")}
                                placeholder="Allergies separated by comma"
                            />
                        ) : (
                            <div className="text-neutral-700 break-words">
                                {arrayToCSV(profile.allergies) ?? '-'}
                            </div>
                        )}
                    </div>

                    {/* CHRONIC */}
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="font-semibold text-base mb-2">
                            Chronic Disease
                        </div>

                        {editMode ? (
                            <TagsInput
                                {...form.getInputProps("chronicDisease")}
                                placeholder="Chronic Disease separated by comma"
                            />
                        ) : (
                            <div className="text-neutral-700 break-words">
                                {arrayToCSV(profile.chronicDisease) ?? '-'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL */}
            <Modal
                centered
                opened={opened}
                onClose={close}
                title={
                    <span className="text-lg sm:text-xl font-semibold">
                        Upload Profile Photo
                    </span>
                }
            >

                <div className="flex flex-col gap-4">

                    <input
                        className="border rounded-lg p-2"
                        type="file"
                        accept="image/png"
                        onChange={(e: any) => {
                            setFile(e.target.files[0]);
                        }}
                    />

                    <Button
                        mt="md"
                        onClick={handlePhotoUpload}
                        fullWidth
                    >
                        Upload
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default Profile;