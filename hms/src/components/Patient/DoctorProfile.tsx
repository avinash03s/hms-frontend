import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../../interceptor/AxiosInterceptor";
import { Button, Skeleton } from "@mantine/core";
import {
  IconStethoscope,
  IconBuildingHospital,
  IconCalendarTime,
} from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { useDisclosure } from "@mantine/hooks";

import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  department: string;
  totalExperience: number;
  qualification?: string;
  about?: string;
  profilePictureId?: number;
}

const DoctorProfile = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const token = useSelector((state: any) => state.jwt);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookOpen, { open: openBook, close: closeBook }] = useDisclosure(false);

  useEffect(() => {
    axiosInstance
      .get("/profile/doctor/all")
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];

        const found = list.find((d: Doctor) =>
          d.name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-") === slug
        );

        setDoctor(found || null);
      })
      .catch(() => setDoctor(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="p-10 max-w-4xl mx-auto">
        <Skeleton height={200} />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-xl font-bold">Doctor not found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col">

      <Navbar />

      <div className="flex-1">

        <div className="max-w-5xl mx-auto p-6">

          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row gap-6">

            <div className="w-32 h-32 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1a6fa8] text-3xl font-bold">
              {doctor.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold">Dr. {doctor.name}</h1>

              <p className="text-[#1a6fa8] font-semibold mt-1">
                {doctor.specialization}
              </p>

              <p className="text-gray-500 mt-1">
                <IconBuildingHospital size={16} className="inline mr-1" />
                {doctor.department}
              </p>

              <p className="text-gray-500 mt-1">
                <IconStethoscope size={16} className="inline mr-1" />
                {doctor.totalExperience} Years Experience
              </p>

              <p className="text-gray-500 mt-1">
                Qualification: {doctor.qualification || "MBBS, MD"}
              </p>

              <Button
                className="mt-4"
                color="#1a6fa8"
                leftSection={<IconCalendarTime size={16} />}
                onClick={() => {
                  if (!token) {
                    navigate("/login");
                    return;
                  }
                  openBook();
                }}
              >
                Book Now
              </Button>
            </div>
          </div>

          <div className="bg-white mt-6 p-6 rounded-2xl shadow-md">
            <h2 className="text-lg font-bold mb-3">About Doctor</h2>

            <p className="text-gray-600 leading-relaxed mb-4">
              {doctor.about ||
                `Dr. ${doctor.name} is a highly skilled and experienced medical professional dedicated to providing exceptional healthcare services. With a strong background in ${doctor.specialization}, the doctor ensures accurate diagnosis, patient-focused treatment, and modern medical care practices.`}
            </p>

            <p className="text-gray-600 leading-relaxed mb-4">
              With more than {doctor.totalExperience} years of clinical experience,
              Dr. {doctor.name} has successfully treated numerous patients and handled
              complex medical cases with a high success rate. The doctor believes in
              combining advanced medical technology with compassionate care.
            </p>

            <p className="text-gray-600 leading-relaxed">
              Working in the {doctor.department} department, the doctor continuously
              updates knowledge with the latest medical research and follows
              evidence-based treatment methods to ensure the best outcomes for patients.
            </p>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DoctorProfile;