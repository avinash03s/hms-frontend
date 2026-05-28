import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

import { useEffect, useState } from "react";

import {
  deletePatient,
  getAllPatients,
} from "../../../service/AdminService";

const bloodGroupColor: Record<string, string> = {
  "A+": "red",
  "A-": "pink",
  "B+": "blue",
  "B-": "cyan",
  "AB+": "grape",
  "AB-": "violet",
  "O+": "teal",
  "O-": "green",

  A_POSITIVE: "red",
  A_NEGATIVE: "pink",
  B_POSITIVE: "blue",
  B_NEGATIVE: "cyan",
  AB_POSITIVE: "grape",
  AB_NEGATIVE: "violet",
  O_POSITIVE: "teal",
  O_NEGATIVE: "green",
};

const avatarColors = [
  "teal",
  "blue",
  "violet",
  "grape",
  "pink",
  "red",
  "orange",
  "cyan",
];

const getInitials = (name: string) =>
  name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "P";

const getAvatarColor = (name: string) =>
  avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length] || "teal";

const formatArrayData = (value: any) => {
  if (!value) return "None";

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "None";
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed.length
          ? parsed.join(", ")
          : "None";
      }
    } catch {
      // ignore
    }

    return (
      value.replace(/[\[\]"]/g, "").trim() ||
      "None"
    );
  }

  return String(value);
};

const AdminPatient = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // PROFILE MODAL
  const [profilePatient, setProfilePatient] =
    useState<any | null>(null);

  const [profileOpen, setProfileOpen] =
    useState(false);

  // DELETE MODAL
  const [deleteId, setDeleteId] =
    useState<number | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);

  const loadPatients = async () => {
    setLoading(true);

    try {
      const res = await getAllPatients();

      setPatients(res.data);
      setFiltered(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);

    const q = value.toLowerCase();

    setFiltered(
      patients.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.phoneNo?.toLowerCase().includes(q)
      )
    );
  };

  const openProfile = (patient: any) => {
    setProfilePatient(patient);
    setProfileOpen(true);
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      await deletePatient(deleteId);

      setDeleteModalOpen(false);
      setDeleteId(null);
      setProfileOpen(false);

      loadPatients();
    }
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "#f8fafb",
        padding: "clamp(12px,2vw,24px)",
      }}
    >
      {/* HEADER */}
      <Group
        justify="space-between"
        mb="xl"
        align="center"
        wrap="wrap"
        gap="md"
      >
        <Title
          order={2}
          style={{
            color: "#20c997",
            fontWeight: 700,
            fontSize:
              "clamp(1.4rem, 2vw, 2rem)",
          }}
        >
          Patients
        </Title>

        <Group
          gap="sm"
          wrap="wrap"
          style={{
            width: "100%",
            justifyContent: "flex-end",
          }}
        >
          <TextInput
            placeholder="Search patients..."
            value={search}
            onChange={(e) =>
              handleSearch(
                e.currentTarget.value
              )
            }
            radius="xl"
            styles={{
              root: {
                width: "100%",
                maxWidth: 280,
              },

              input: {
                border:
                  "1.5px solid #e0f5ef",
                background: "#fff",
              },
            }}
          />

          <Badge
            size="lg"
            radius="xl"
            color="teal"
            variant="light"
            style={{
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {filtered.length} Patients
          </Badge>
        </Group>
      </Group>

      {/* LOADING */}
      {loading && (
        <Group justify="center" mt={80}>
          <Loader
            color="teal"
            size="xl"
          />
        </Group>
      )}

      {/* PATIENT GRID */}
      {!loading && (
        <SimpleGrid
          cols={{
            base: 1,
            sm: 2,
            lg: 3,
            xl: 4,
          }}
          spacing="lg"
        >
          {filtered.map((patient) => (
            <Box key={patient.id}>
              <Card
                shadow="sm"
                radius="xl"
                p={0}
                onClick={() =>
                  openProfile(patient)
                }
                style={{
                  border:
                    "1.5px solid #e8f5f0",
                  overflow: "hidden",
                  height: "100%",
                  cursor: "pointer",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) => {
                  (
                    e.currentTarget as HTMLDivElement
                  ).style.boxShadow =
                    "0 6px 24px rgba(32,201,151,0.15)";

                  (
                    e.currentTarget as HTMLDivElement
                  ).style.transform =
                    "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (
                    e.currentTarget as HTMLDivElement
                  ).style.boxShadow =
                    "";

                  (
                    e.currentTarget as HTMLDivElement
                  ).style.transform =
                    "";
                }}
              >
                {/* TOP BAR */}
                <Box
                  style={{
                    height: 4,
                    background:
                      "linear-gradient(90deg, #20c997, #12b886)",
                  }}
                />

                <Box
                  style={{
                    padding:
                      "clamp(14px,2vw,22px)",
                  }}
                >
                  {/* PROFILE */}
                  <Group
                    gap="md"
                    mb="md"
                    align="flex-start"
                    wrap="nowrap"
                  >
                    <Avatar
                      src={
                        patient.profilePictureUrl ||
                        patient.profileImage ||
                        null
                      }
                      size={56}
                      radius="xl"
                      color={getAvatarColor(
                        patient.name || ""
                      )}
                      style={{
                        border:
                          "2.5px solid #e0f5ef",
                        boxShadow:
                          "0 2px 8px rgba(32,201,151,0.15)",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(
                        patient.name || "P"
                      )}
                    </Avatar>

                    <Stack
                      gap={2}
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <Text
                        fw={700}
                        size="md"
                        lineClamp={2}
                        style={{
                          color: "#1a1a2e",
                          lineHeight: 1.2,
                        }}
                      >
                        {patient.name}
                      </Text>

                      <Badge
                        size="sm"
                        radius="md"
                        color={
                          bloodGroupColor[
                            patient.bloodGroup
                          ] || "teal"
                        }
                        variant="light"
                        style={{
                          width:
                            "fit-content",
                        }}
                      >
                        {patient.bloodGroup ||
                          "—"}
                      </Badge>
                    </Stack>
                  </Group>

                  <Box
                    style={{
                      height: 1,
                      background: "#e8f5f0",
                      marginBottom: 14,
                    }}
                  />

                  <Text
                    size="xs"
                    c="dimmed"
                    lineClamp={1}
                    style={{
                      wordBreak:
                        "break-word",
                    }}
                  >
                    {patient.email || "—"}
                  </Text>

                  <Button
                    fullWidth
                    mt="md"
                    radius="xl"
                    size="sm"
                    color="red"
                    variant="light"
                    onClick={(e) => {
                      e.stopPropagation();

                      confirmDelete(
                        patient.id
                      );
                    }}
                  >
                    Delete Patient
                  </Button>
                </Box>
              </Card>
            </Box>
          ))}

          {/* EMPTY */}
          {filtered.length === 0 && (
            <Box
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "80px 20px",
              }}
            >
              <Text
                size="lg"
                fw={600}
                c="dimmed"
              >
                No patients found
              </Text>
            </Box>
          )}
        </SimpleGrid>
      )}

      {/* PROFILE MODAL */}
      <Modal
        opened={profileOpen}
        onClose={() =>
          setProfileOpen(false)
        }
        title={
          <Text
            fw={700}
            size="lg"
            c="teal"
          >
            Patient Profile
          </Text>
        }
        centered
        radius="xl"
        size="md"
        styles={{
          body: {
            overflowX: "hidden",
          },
        }}
      >
        {profilePatient && (
          <Stack gap="lg">

            {/* TOP PROFILE */}
            <Group
              gap="md"
              align="center"
              wrap="nowrap"
            >
              <Avatar
                src={
                  profilePatient.profilePictureUrl ||
                  profilePatient.profileImage ||
                  null
                }
                size={90}
                radius="xl"
                color={getAvatarColor(
                  profilePatient.name || ""
                )}
                style={{
                  border:
                    "4px solid #e0f5ef",
                  boxShadow:
                    "0 4px 18px rgba(32,201,151,0.18)",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {getInitials(
                  profilePatient.name || "P"
                )}
              </Avatar>

              <Stack
                gap={4}
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Text
                  fw={800}
                  size="xl"
                  style={{
                    wordBreak:
                      "break-word",
                  }}
                >
                  {profilePatient.name}
                </Text>

                <Badge
                  size="lg"
                  radius="xl"
                  color={
                    bloodGroupColor[
                      profilePatient
                        .bloodGroup
                    ] || "teal"
                  }
                  variant="light"
                  style={{
                    width: "fit-content",
                  }}
                >
                  BLOOD GROUP :{" "}
                  {profilePatient.bloodGroup ||
                    "—"}
                </Badge>

                <Text
                  size="sm"
                  c="dimmed"
                  style={{
                    wordBreak:
                      "break-word",
                    overflowWrap:
                      "anywhere",
                  }}
                >
                  {profilePatient.email}
                </Text>
              </Stack>
            </Group>

            <Divider />

            {/* PERSONAL INFO */}
            <Box>
              <Text
                fw={700}
                mb="sm"
                c="teal"
              >
                Personal Information
              </Text>

              <SimpleGrid
                cols={{
                  base: 1,
                  sm: 2,
                }}
                spacing="md"
                verticalSpacing="md"
              >
                <Box>
                  <Text
                    size="xs"
                    c="dimmed"
                  >
                    Patient ID
                  </Text>

                  <Text fw={600}>
                    #{profilePatient.id}
                  </Text>
                </Box>

                <Box>
                  <Text
                    size="xs"
                    c="dimmed"
                  >
                    Blood Group
                  </Text>

                  <Text fw={600}>
                    {profilePatient.bloodGroup ||
                      "—"}
                  </Text>
                </Box>

                <Box>
                  <Text
                    size="xs"
                    c="dimmed"
                  >
                    Allergies
                  </Text>

                  <Text
                    fw={600}
                    style={{
                      wordBreak:
                        "break-word",
                      overflowWrap:
                        "anywhere",
                    }}
                  >
                    {formatArrayData(
                      profilePatient.allergies
                    )}
                  </Text>
                </Box>

                <Box>
                  <Text
                    size="xs"
                    c="dimmed"
                  >
                    Chronic Disease
                  </Text>

                  <Text
                    fw={600}
                    style={{
                      wordBreak:
                        "break-word",
                      overflowWrap:
                        "anywhere",
                    }}
                  >
                    {formatArrayData(
                      profilePatient.chronicDisease
                    )}
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>

            <Divider />

            {/* CONTACT INFO */}
            <Box>
              <Text
                fw={700}
                mb="sm"
                c="teal"
              >
                Contact Information
              </Text>

              <SimpleGrid
                cols={{
                  base: 1,
                  sm: 2,
                }}
                spacing="md"
                verticalSpacing="md"
              >
                <Box>
                  <Text
                    size="xs"
                    c="dimmed"
                  >
                    Phone
                  </Text>

                  <Text fw={600}>
                    {profilePatient.phoneNo ||
                      "Not Available"}
                  </Text>
                </Box>

                <Box>
                  <Text
                    size="xs"
                    c="dimmed"
                  >
                    Email
                  </Text>

                  <Text
                    fw={600}
                    style={{
                      wordBreak:
                        "break-word",
                      overflowWrap:
                        "anywhere",
                    }}
                  >
                    {profilePatient.email ||
                      "—"}
                  </Text>
                </Box>

                <Box
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >
                  <Text
                    size="xs"
                    c="dimmed"
                  >
                    Address
                  </Text>

                  <Text
                    fw={600}
                    style={{
                      wordBreak:
                        "break-word",
                      overflowWrap:
                        "anywhere",
                    }}
                  >
                    {profilePatient.address ||
                      "Address not added"}
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>

            <Divider />

            {/* ACCOUNT INFO */}
            <Box>
              <Text
                fw={700}
                mb="sm"
                c="teal"
              >
                Account Information
              </Text>

              <SimpleGrid
                cols={{
                  base: 1,
                  sm: 2,
                }}
                spacing="md"
                verticalSpacing="md"
              >
                <Box>
                  <Text
                    size="xs"
                    c="dimmed"
                  >
                    Status
                  </Text>

                  <Badge
                    color={
                      profilePatient.active ===
                      false
                        ? "red"
                        : "teal"
                    }
                    radius="xl"
                    variant="light"
                  >
                    {profilePatient.active ===
                    false
                      ? "Inactive"
                      : "Active"}
                  </Badge>
                </Box>
              </SimpleGrid>
            </Box>

            <Divider />

            {/* BUTTONS */}
            <Group grow>
              <Button
                color="red"
                variant="light"
                radius="xl"
                onClick={() => {
                  setProfileOpen(false);

                  confirmDelete(
                    profilePatient.id
                  );
                }}
              >
                Delete Patient
              </Button>

              <Button
                variant="light"
                color="teal"
                radius="xl"
                onClick={() =>
                  setProfileOpen(false)
                }
              >
                Close
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        opened={deleteModalOpen}
        onClose={() =>
          setDeleteModalOpen(false)
        }
        title={
          <Text
            fw={700}
            c="red"
            size="lg"
          >
            Confirm Delete
          </Text>
        }
        centered
        radius="xl"
        size="sm"
      >
        <Text c="dimmed" mb="lg">
          Are you sure you want to
          delete this patient?
        </Text>

        <Group
          justify="flex-end"
          gap="sm"
        >
          <Button
            variant="light"
            radius="xl"
            onClick={() =>
              setDeleteModalOpen(false)
            }
          >
            Cancel
          </Button>

          <Button
            color="red"
            radius="xl"
            onClick={handleDelete}
          >
            Yes, Delete
          </Button>
        </Group>
      </Modal>
    </Box>
  );
};

export default AdminPatient;