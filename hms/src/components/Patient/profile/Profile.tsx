import {
  Avatar, Button, Divider, Modal,
  NumberInput, Select, Table, TagsInput, TextInput, Badge
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  IconEdit, IconCheck, IconUser, IconPhone,
  IconMapPin, IconDroplet, IconAlertTriangle,
  IconHeartbeat, IconId, IconCalendar, IconCamera,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";

import { bloodGroups } from "../../../data/DropDownData";
import {
  getPatient, updatePatient, uploadProfilePhoto
} from "../../../service/PatientProfileService";
import { formatDate } from "../../../utility/DateUtility";
import { errorNotification, successNotification } from "../../../utility/Notification";
import { arrayToCSV } from "../../../utility/OtherUtility";
import Navbar from "../../layout/Navbar";
import Footer from "../../layout/Footer";



const bloodColor: Record<string, string> = {
  A_POSITIVE: "#dc2626", A_NEGATIVE: "#f87171",
  B_POSITIVE: "#2563eb", B_NEGATIVE: "#818cf8",
  O_POSITIVE: "#0d9488", O_NEGATIVE: "#34d399",
  AB_POSITIVE: "#d97706", AB_NEGATIVE: "#fcd34d",
};

const formatBlood = (bg: string) =>
  bg ? bg.replace("_POSITIVE", "+").replace("_NEGATIVE", "−") : "—";

const calcAge = (dob: string) =>
  dob ? Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;


const InfoRow = ({
  icon, label, value, editNode,
  editMode,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  editNode?: React.ReactNode;
  editMode: boolean;
}) => (
  <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-[#1a6fa8] shrink-0 mt-0.5">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
      {editMode && editNode ? (
        <div className="max-w-sm">{editNode}</div>
      ) : (
        <p className="text-sm font-semibold text-gray-900">{value || "—"}</p>
      )}
    </div>
  </div>
);


const Profile = () => {
  const user = useSelector((state: any) => state.user);
  const [editMode, setEdit] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [profile, setProfile] = useState<any>({});
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (user?.profileId) {
      getPatient(user.profileId)
        .then((data) => {
          setProfile({
            ...data,
            allergies: data.allergies ? JSON.parse(data.allergies) : [],
            chronicDisease: data.chronicDisease ? JSON.parse(data.chronicDisease) : [],
          });
        })
        .catch(console.error);
    }
  }, [user?.profileId]);

  const form = useForm({
    initialValues: {
      dob: "", phoneNo: "", address: "",
      aadharId: "", bloodGroup: "",
      allergies: [] as string[],
      chronicDisease: [] as string[],
    },
    validate: {
      phoneNo: (v) => !v ? "Phone number is required" : null,
      address: (v) => !v ? "Address is required" : null,
      aadharId: (v) => !v ? "Aadhar number is required" : null,
    },
  });

  const handleEdit = () => {
    form.setValues({
      ...profile,
      dob: profile.dob ? new Date(profile.dob) : undefined,
      chronicDisease: profile.chronicDisease ?? [],
      allergies: profile.allergies ?? [],
    });
    setEdit(true);
  };

  const handleSubmit = () => {
    const result = form.validate();
    if (result.hasErrors) {
      errorNotification(Object.values(result.errors)[0] as string);
      return;
    }
    const values = form.getValues();
    updatePatient({
      ...profile, ...values,
      allergies: values.allergies ? JSON.stringify(values.allergies) : null,
      chronicDisease: values.chronicDisease ? JSON.stringify(values.chronicDisease) : null,
    })
      .then(() => {
        successNotification("Profile Updated Successfully");
        setProfile({ ...profile, ...values });
        setEdit(false);
      })
      .catch((err) => errorNotification(err?.response?.data?.errorMessage || "Something went wrong"));
  };

  const handlePhotoUpload = async () => {
    if (!file) { errorNotification("Please select PNG image"); return; }
    if (file.type !== "image/png") { errorNotification("Only PNG image allowed"); return; }
    try {
      const response = await uploadProfilePhoto(file, profile?.profilePictureId);
      const updatedProfile = {
        ...profile,
        profilePictureId: response.id,
        allergies: profile.allergies ? JSON.stringify(profile.allergies) : null,
        chronicDisease: profile.chronicDisease ? JSON.stringify(profile.chronicDisease) : null,
      };
      await updatePatient(updatedProfile);
      setProfile({ ...profile, profilePictureId: response.id });
      successNotification("Photo Uploaded");
      setFile(null);
      close();
    } catch (err: any) {
      errorNotification(err?.response?.data?.errorMessage || "Upload failed");
    }
  };

  const age = calcAge(profile.dob);
  const bgColor = bloodColor[profile.bloodGroup] ?? "#94a3b8";

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col">
      <Navbar />

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 flex-1">

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Your Account</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your personal information and health details</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">

          <div className="h-2 bg-[#1a6fa8]" />

          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

              <div className="relative shrink-0">
                <Avatar
                  variant="filled"
                  src={
                    profile?.profilePictureId
                      ? `http://localhost:9000/profile/files/${profile.profilePictureId}`
                      : "/avatar.png"
                  }
                  size={90}
                  radius="xl"
                  alt="profile"
                />
                {profile.bloodGroup && (
                  <div
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg border-2 border-white flex items-center justify-center text-[10px] font-extrabold text-white shadow-md"
                    style={{ background: bgColor }}
                  >
                    {formatBlood(profile.bloodGroup)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-extrabold text-gray-900 mb-0.5">{user?.name}</h2>
                <p className="text-sm text-gray-400 mb-2">{user?.email}</p>
                <div className="flex flex-wrap gap-2">
                  {age && (
                    <Badge color="blue" variant="light" size="sm">
                      {age} years old
                    </Badge>
                  )}
                  {profile.bloodGroup && (
                    <Badge variant="light" size="sm" style={{ background: `${bgColor}15`, color: bgColor }}>
                      Blood: {formatBlood(profile.bloodGroup)}
                    </Badge>
                  )}
                  {(profile.chronicDisease?.length > 0) && (
                    profile.chronicDisease.map((d: string) => (
                      <Badge key={d} color="red" variant="light" size="sm">
                        {d}
                      </Badge>
                    ))
                  )}
                  {(profile.allergies?.length > 0) && (
                    profile.allergies.map((a: string) => (
                      <Badge key={a} color="yellow" variant="light" size="sm">
                        ⚠ {a}
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <div className="shrink-0 flex flex-col gap-2">
                {!editMode ? (
                  <>
                    <Button
                      onClick={handleEdit}
                      variant="outline" color="#1a6fa8" radius="md" size="sm"
                      leftSection={<IconEdit size={15} />}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      onClick={open}
                      variant="light" color="#1a6fa8" radius="md" size="sm"
                      leftSection={<IconCamera size={15} />}
                    >
                      Change Photo
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    color="#1a6fa8" radius="md" size="sm"
                    leftSection={<IconCheck size={15} />}
                  >
                    Save Changes
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <IconUser size={18} className="text-[#1a6fa8]" stroke={1.5} />
            Personal Information
          </h3>

          <div>
            <InfoRow
              icon={<IconCalendar size={17} stroke={1.5} />}
              label="Date of Birth"
              value={formatDate(profile.dob)}
              editMode={editMode}
              editNode={
                <DateInput {...form.getInputProps("dob")} placeholder="Date of Birth" size="sm" radius="md" />
              }
            />
            <InfoRow
              icon={<IconPhone size={17} stroke={1.5} />}
              label="Phone Number"
              value={profile.phoneNo}
              editMode={editMode}
              editNode={
                <NumberInput
                  {...form.getInputProps("phoneNo")}
                  maxLength={10} clampBehavior="strict"
                  placeholder="Phone number" size="sm" radius="md"
                />
              }
            />
            <InfoRow
              icon={<IconMapPin size={17} stroke={1.5} />}
              label="Address"
              value={profile.address}
              editMode={editMode}
              editNode={
                <TextInput {...form.getInputProps("address")} placeholder="Address" size="sm" radius="md" />
              }
            />
            <InfoRow
              icon={<IconId size={17} stroke={1.5} />}
              label="Aadhar Number"
              value={profile.aadharId}
              editMode={editMode}
              editNode={
                <NumberInput
                  {...form.getInputProps("aadharId")}
                  maxLength={12} clampBehavior="strict"
                  placeholder="Aadhar Number" size="sm" radius="md"
                />
              }
            />
            <InfoRow
              icon={<IconDroplet size={17} stroke={1.5} />}
              label="Blood Group"
              value={formatBlood(profile.bloodGroup)}
              editMode={editMode}
              editNode={
                <Select
                  {...form.getInputProps("bloodGroup")}
                  placeholder="Blood group" data={bloodGroups} size="sm" radius="md"
                />
              }
            />
            <InfoRow
              icon={<IconAlertTriangle size={17} stroke={1.5} />}
              label="Allergies"
              value={arrayToCSV(profile.allergies)}
              editMode={editMode}
              editNode={
                <TagsInput
                  {...form.getInputProps("allergies")}
                  placeholder="Add allergy and press Enter" size="sm" radius="md"
                />
              }
            />
            <InfoRow
              icon={<IconHeartbeat size={17} stroke={1.5} />}
              label="Chronic Disease"
              value={arrayToCSV(profile.chronicDisease)}
              editMode={editMode}
              editNode={
                <TagsInput
                  {...form.getInputProps("chronicDisease")}
                  placeholder="Add disease and press Enter" size="sm" radius="md"
                />
              }
            />
          </div>

          {editMode && (
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <Button
                onClick={handleSubmit}
                color="#1a6fa8" radius="md" size="sm"
                leftSection={<IconCheck size={15} />}
              >
                Save Changes
              </Button>
              <Button
                onClick={() => setEdit(false)}
                variant="outline" color="gray" radius="md" size="sm"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>


      <Modal
        centered opened={opened} onClose={close}
        title={<span className="font-bold text-gray-900">Change Profile Photo</span>}
        radius="lg"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">Only PNG images are allowed.</p>
          <input
            className="border border-gray-200 rounded-lg p-2.5 text-sm w-full"
            type="file" accept="image/png"
            onChange={(e: any) => setFile(e.target.files[0])}
          />
          <Button onClick={handlePhotoUpload} fullWidth color="#1a6fa8" radius="md">
            Upload Photo
          </Button>
        </div>
      </Modal>

      <Footer />
    </div>
  );
};

export default Profile;