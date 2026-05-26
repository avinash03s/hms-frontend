import {
    Avatar,
    Button,
    Divider,
    Modal,
    NumberInput,
    Select,
    Table,
    TextInput
} from "@mantine/core";

import { DateInput } from "@mantine/dates";
import { IconEdit } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
    doctorDepartments,
    doctorSpecializations
} from "../../../data/DropDownData";

import { useDisclosure } from "@mantine/hooks";

import {
    getDoctor,
    updateDoctor,
    uploadProfilePhoto
} from "../../../service/DoctorProfileService";

import { useForm } from "@mantine/form";

import { formatDate } from "../../../utility/DateUtility";

import {
    errorNotification,
    successNotification
} from "../../../utility/Notification";

import { setUser } from "../../../slices/UserSlices";

const Profile = () => {

    const dispatch = useDispatch();

    const user = useSelector((state: any) => state.user);

    const [editMode, setEdit] = useState(false);

    const [opened, { open, close }] = useDisclosure(false);

    const [profile, setProfile] = useState<any>({});

    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {

        if (user?.profileId) {

            getDoctor(user.profileId)
                .then((data) => {

                    console.log("DOCTOR API RESPONSE:", data);

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

            dob: (value) =>
                !value ? 'Date of Birth is required' : undefined,

            phoneNo: (value) =>
                !value ? 'Phone number is required' : undefined,

            address: (value) =>
                !value ? 'Address is required' : undefined,

            licenseNumber: (value) =>
                !value ? 'licenseNumber number is required' : undefined,
        },
    });

    const handleEdit = () => {

        form.setValues({
            ...profile,
            dob: profile.dob ? new Date(profile.dob) : undefined,
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
            };

            await updateDoctor(updatedProfile);

            setProfile(updatedProfile);

            dispatch(setUser({
                ...user,
                profilePictureId: response.id,
            }));

            successNotification("Photo Uploaded Successfully");

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

        updateDoctor({
            ...profile,
            ...values,
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

            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">

                <div className="flex flex-col sm:flex-row gap-5 sm:items-center">

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

                        {
                            editMode && (

                                <Button
                                    size="sm"
                                    onClick={open}
                                    variant="filled"
                                    className="w-full sm:w-auto"
                                >
                                    Upload
                                </Button>
                            )
                        }
                    </div>

                    <div className="flex flex-col gap-2 break-all">

                        <div className="text-2xl sm:text-3xl font-semibold text-neutral-900">
                            {user.name}
                        </div>

                        <div className="text-base sm:text-xl text-neutral-700 break-all">
                            {user.email}
                        </div>
                    </div>
                </div>

                <div className="w-full sm:w-auto">

                    {
                        !editMode ? (

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
                        )
                    }
                </div>
            </div>

            <Divider my="xl" />

            <div>

                <div className="text-xl sm:text-2xl font-semibold mb-5 text-neutral-900">
                    Personal Information
                </div>

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

                                {
                                    editMode ? (

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
                                    )
                                }
                            </Table.Tr>

                            {/* PHONE */}

                            <Table.Tr>

                                <Table.Td className="font-semibold text-lg lg:text-xl">
                                    Phone
                                </Table.Td>

                                {
                                    editMode ? (

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
                                    )
                                }
                            </Table.Tr>

                            {/* ADDRESS */}

                            <Table.Tr>

                                <Table.Td className="font-semibold text-lg lg:text-xl">
                                    Address
                                </Table.Td>

                                {
                                    editMode ? (

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
                                    )
                                }
                            </Table.Tr>

                            {/* LICENSE */}

                            <Table.Tr>

                                <Table.Td className="font-semibold text-lg lg:text-xl">
                                    License No
                                </Table.Td>

                                {
                                    editMode ? (

                                        <Table.Td>

                                            <NumberInput
                                                {...form.getInputProps("licenseNumber")}
                                                maxLength={12}
                                                clampBehavior="strict"
                                                placeholder="License No"
                                            />

                                        </Table.Td>

                                    ) : (

                                        <Table.Td className="text-base lg:text-xl">
                                            {profile.licenseNumber ?? '-'}
                                        </Table.Td>
                                    )
                                }
                            </Table.Tr>

                            {/* SPECIALIZATION */}

                            <Table.Tr>

                                <Table.Td className="font-semibold text-lg lg:text-xl">
                                    Specialization
                                </Table.Td>

                                {
                                    editMode ? (

                                        <Table.Td>

                                            <Select
                                                {...form.getInputProps("specialization")}
                                                placeholder="Specialization"
                                                data={doctorSpecializations}
                                            />

                                        </Table.Td>

                                    ) : (

                                        <Table.Td className="text-base lg:text-xl">
                                            {profile.specialization ?? '-'}
                                        </Table.Td>
                                    )
                                }
                            </Table.Tr>

                            {/* DEPARTMENT */}

                            <Table.Tr>

                                <Table.Td className="font-semibold text-lg lg:text-xl">
                                    Department
                                </Table.Td>

                                {
                                    editMode ? (

                                        <Table.Td>

                                            <Select
                                                {...form.getInputProps("department")}
                                                placeholder="Department"
                                                data={doctorDepartments}
                                            />

                                        </Table.Td>

                                    ) : (

                                        <Table.Td className="text-base lg:text-xl">
                                            {profile.department ?? '-'}
                                        </Table.Td>
                                    )
                                }
                            </Table.Tr>

                            {/* EXPERIENCE */}

                            <Table.Tr>

                                <Table.Td className="font-semibold text-lg lg:text-xl">
                                    Total Experience
                                </Table.Td>

                                {
                                    editMode ? (

                                        <Table.Td>

                                            <NumberInput
                                                {...form.getInputProps("totalExperience")}
                                                maxLength={2}
                                                max={50}
                                                clampBehavior="strict"
                                                placeholder="Total Experience"
                                            />

                                        </Table.Td>

                                    ) : (

                                        <Table.Td className="text-base lg:text-xl">
                                            {profile.totalExperience ?? '-'}
                                            {
                                                profile.totalExperience
                                                    ? ' years'
                                                    : ''
                                            }
                                        </Table.Td>
                                    )
                                }
                            </Table.Tr>

                        </Table.Tbody>
                    </Table>
                </div>

                <div className="flex flex-col gap-4 md:hidden">

                    {/* DOB */}

                    <div className="bg-white rounded-xl border p-4 shadow-sm">

                        <div className="font-semibold text-base mb-2">
                            Date of Birth
                        </div>

                        {
                            editMode ? (

                                <DateInput
                                    {...form.getInputProps("dob")}
                                    placeholder="Date of Birth"
                                />

                            ) : (

                                <div className="text-neutral-700">
                                    {formatDate(profile.dob) ?? '-'}
                                </div>
                            )
                        }
                    </div>


                    <div className="bg-white rounded-xl border p-4 shadow-sm">

                        <div className="font-semibold text-base mb-2">
                            Phone
                        </div>

                        {
                            editMode ? (

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
                            )
                        }
                    </div>



                    <div className="bg-white rounded-xl border p-4 shadow-sm">

                        <div className="font-semibold text-base mb-2">
                            Address
                        </div>

                        {
                            editMode ? (

                                <TextInput
                                    {...form.getInputProps("address")}
                                    placeholder="Address"
                                />

                            ) : (

                                <div className="text-neutral-700 break-words">
                                    {profile.address ?? '-'}
                                </div>
                            )
                        }
                    </div>


                    <div className="bg-white rounded-xl border p-4 shadow-sm">

                        <div className="font-semibold text-base mb-2">
                            License No
                        </div>

                        {
                            editMode ? (

                                <NumberInput
                                    {...form.getInputProps("licenseNumber")}
                                    maxLength={12}
                                    clampBehavior="strict"
                                    placeholder="License No"
                                />

                            ) : (

                                <div className="text-neutral-700">
                                    {profile.licenseNumber ?? '-'}
                                </div>
                            )
                        }
                    </div>


                    <div className="bg-white rounded-xl border p-4 shadow-sm">

                        <div className="font-semibold text-base mb-2">
                            Specialization
                        </div>

                        {
                            editMode ? (

                                <Select
                                    {...form.getInputProps("specialization")}
                                    placeholder="Specialization"
                                    data={doctorSpecializations}
                                />

                            ) : (

                                <div className="text-neutral-700">
                                    {profile.specialization ?? '-'}
                                </div>
                            )
                        }
                    </div>


                    <div className="bg-white rounded-xl border p-4 shadow-sm">

                        <div className="font-semibold text-base mb-2">
                            Department
                        </div>

                        {
                            editMode ? (

                                <Select
                                    {...form.getInputProps("department")}
                                    placeholder="Department"
                                    data={doctorDepartments}
                                />

                            ) : (

                                <div className="text-neutral-700">
                                    {profile.department ?? '-'}
                                </div>
                            )
                        }
                    </div>

                    <div className="bg-white rounded-xl border p-4 shadow-sm">

                        <div className="font-semibold text-base mb-2">
                            Total Experience
                        </div>

                        {
                            editMode ? (

                                <NumberInput
                                    {...form.getInputProps("totalExperience")}
                                    maxLength={2}
                                    max={50}
                                    clampBehavior="strict"
                                    placeholder="Total Experience"
                                />

                            ) : (

                                <div className="text-neutral-700">
                                    {profile.totalExperience ?? '-'}
                                    {
                                        profile.totalExperience
                                            ? ' years'
                                            : ''
                                    }
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>

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